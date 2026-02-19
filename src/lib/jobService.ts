import { generateRisk } from "@/lib/generateRisk";
import { validateAndStandardizeRoleWithGemini } from "@/lib/gemini";
import { connectDB } from "@/lib/mongodb";
import { isRealisticProfession, normalizeJobId, standardizedRoleName } from "@/lib/jobUtils";
import Job, { type JobDocument } from "@/models/job";
import type { JobAnalysis } from "@/types/job";

class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

function toJobAnalysis(job: JobDocument): JobAnalysis {
  return {
    jobId: job.jobId,
    jobTitle: job.jobTitle,
    industry: job.industry,
    risk_score: job.risk_score,
    risk_level: job.risk_level,
    automation_percentage: job.automation_percentage,
    time_horizon: job.time_horizon,
    reason: job.reason,
    future_skills: job.future_skills,
    createdAt: job.createdAt,
  };
}

async function fallbackRoleValidation(
  rawJobInput: string,
): Promise<{ is_valid: boolean; standardized_role: string; industry: string }> {
  const standardizedRole = standardizedRoleName(rawJobInput);
  const valid = Boolean(standardizedRole) && isRealisticProfession(standardizedRole);

  const generated = standardizedRole ? await generateRisk(standardizedRole) : null;

  return {
    is_valid: valid,
    standardized_role: standardizedRole,
    industry: generated?.industry ?? "General",
  };
}

export async function getOrCreateJob(rawJobInput: string): Promise<JobAnalysis> {
  const normalizedJobId = normalizeJobId(rawJobInput);

  if (!normalizedJobId) {
    throw new AppError("Invalid job input", 400);
  }

  await connectDB();

  const existing = await Job.findOne({ jobId: normalizedJobId }).lean<JobDocument | null>();
  if (existing) {
    return toJobAnalysis(existing);
  }

  const validated = await validateAndStandardizeRoleWithGemini(rawJobInput).catch(async (error: unknown) => {
    const fallback = await fallbackRoleValidation(rawJobInput);
    if (fallback.is_valid) {
      return fallback;
    }

    if (error instanceof Error && error.message.includes("GEMINI_API_KEY")) {
      throw new AppError("Server configuration error: GEMINI_API_KEY is missing", 500);
    }

    throw new AppError("Role validation failed. Please try again.", 502);
  });

  if (!validated.is_valid || !validated.standardized_role) {
    throw new AppError("Please enter a realistic profession", 400);
  }

  const canonicalJobId = normalizeJobId(validated.standardized_role);
  if (!canonicalJobId) {
    throw new AppError("Invalid role format returned by AI validation", 400);
  }

  const existingByCanonicalRole = await Job.findOne({ jobId: canonicalJobId }).lean<JobDocument | null>();
  if (existingByCanonicalRole) {
    return toJobAnalysis(existingByCanonicalRole);
  }

  const generated = await generateRisk(validated.standardized_role);

  const created = await Job.findOneAndUpdate(
    { jobId: canonicalJobId },
    {
      $setOnInsert: {
        jobId: canonicalJobId,
        jobTitle: validated.standardized_role,
        industry: validated.industry || generated.industry,
        risk_score: generated.risk_score,
        risk_level: generated.risk_level,
        automation_percentage: generated.automation_percentage,
        time_horizon: generated.time_horizon,
        reason: generated.reason,
        future_skills: generated.future_skills,
      },
    },
    {
      returnDocument: "after",
      upsert: true,
      setDefaultsOnInsert: true,
    },
  ).lean<JobDocument>();

  if (!created) {
    throw new AppError("Unable to persist generated job analysis", 500);
  }

  return toJobAnalysis(created);
}

export async function searchJobs(query: string): Promise<Pick<JobAnalysis, "jobId" | "jobTitle" | "industry">[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  await connectDB();

  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const jobs = await Job.find({ jobTitle: { $regex: escaped, $options: "i" } })
    .sort({ createdAt: -1 })
    .limit(5)
    .select({ _id: 0, jobId: 1, jobTitle: 1, industry: 1 })
    .lean<Array<Pick<JobAnalysis, "jobId" | "jobTitle" | "industry">>>();

  return jobs;
}

export function toErrorPayload(error: unknown): { message: string; statusCode: number } {
  if (error instanceof AppError) {
    return { message: error.message, statusCode: error.statusCode };
  }

  if (error instanceof Error) {
    return { message: error.message, statusCode: 500 };
  }

  return { message: "Unexpected error", statusCode: 500 };
}
