import { inferIndustry } from "@/lib/jobUtils";
import type { GeneratedRisk, RiskLevel } from "@/types/job";

const TIME_HORIZONS = ["2-4 years", "4-7 years", "7-10 years"];

const SKILL_LIBRARY = [
  "AI tool orchestration",
  "Prompt engineering",
  "Data literacy",
  "Critical thinking",
  "Complex problem solving",
  "Human communication",
  "Domain specialization",
  "Workflow automation",
  "Cross-functional collaboration",
  "Ethical AI oversight",
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clampRiskScore(value: unknown, fallback: number): number {
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(5, Math.min(95, numeric));
}

function extractJsonBlock(input: string): string {
  const trimmed = input.trim();
  if (trimmed.startsWith("```") && trimmed.endsWith("```")) {
    return trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  }
  return trimmed;
}

function deriveRiskLevel(score: number): RiskLevel {
  if (score <= 39) return "Low";
  if (score <= 69) return "Medium";
  return "High";
}

function pickFutureSkills(seed: number): string[] {
  const rotated = [...SKILL_LIBRARY.slice(seed), ...SKILL_LIBRARY.slice(0, seed)];
  return rotated.slice(0, 4);
}

export async function generateRisk(jobTitle: string): Promise<GeneratedRisk> {
  const lowerTitle = jobTitle.toLowerCase();

  // 🔹 Rule Buckets
  const buckets = [
    { keywords: ["judge", "ias", "ips", "entrepreneur", "army", "navy"], base: 15 },
    { keywords: ["doctor", "nurse", "teacher", "electrician", "plumber", "police"], base: 30 },
    { keywords: ["developer", "engineer", "analyst", "accountant", "lawyer"], base: 45 },
    { keywords: ["manager", "consultant", "marketing", "hr", "banker"], base: 55 },
    { keywords: ["clerk", "cashier", "data entry", "telecaller", "bpo"], base: 75 },
    { keywords: ["driver", "delivery", "content writer", "graphic designer"], base: 80 }
  ];

  let riskScore = 50;
  let matched = false;

  for (const bucket of buckets) {
    if (bucket.keywords.some((k) => lowerTitle.includes(k))) {
      riskScore = bucket.base + randomInt(-5, 8);
      matched = true;
      break;
    }
  }

  // 🔹 If not matched confidently → Call Gemini
  if (!matched) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `
Rate automation risk for the job "${jobTitle}" in India.
Return JSON only in this format:
{
  "risk_score": number (0-100),
  "reason": string,
  "future_skills": string[]
}
`
                  }
                ]
              }
            ]
          })
        }
      );

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (text) {
        const parsed = JSON.parse(extractJsonBlock(text)) as {
          risk_score?: unknown;
          reason?: unknown;
          future_skills?: unknown;
        };
        riskScore = clampRiskScore(parsed.risk_score, riskScore);
        const reason =
          typeof parsed.reason === "string" && parsed.reason.trim().length > 0
            ? parsed.reason.trim()
            : `The role of ${jobTitle} will be gradually reshaped by AI adoption, with automation potential varying by workflow and specialization.`;
        const futureSkills = Array.isArray(parsed.future_skills)
          ? parsed.future_skills.filter((skill): skill is string => typeof skill === "string" && skill.trim().length > 0)
          : [];

        return {
          risk_score: riskScore,
          risk_level: deriveRiskLevel(riskScore),
          automation_percentage: Math.min(
            95,
            Math.max(15, riskScore + randomInt(-5, 10))
          ),
          time_horizon:
            riskScore >= 75
              ? "5-10 years"
              : riskScore >= 55
              ? "10-15 years"
              : riskScore >= 35
              ? "15-20 years"
              : "20+ years",
          reason,
          future_skills: futureSkills.length > 0 ? futureSkills.slice(0, 6) : pickFutureSkills(riskScore % SKILL_LIBRARY.length),
          industry: inferIndustry(jobTitle),
        };
      }
    } catch (err) {
      console.error("Gemini fallback failed:", err);
    }
  }

  // 🔹 Rule-based final output (fast path)
  riskScore = clampRiskScore(riskScore, 50);

  const riskLevel = deriveRiskLevel(riskScore);

  const automationPercentage = Math.min(
    95,
    Math.max(15, riskScore + randomInt(-8, 12))
  );

  const timeHorizon =
    riskScore >= 75
      ? TIME_HORIZONS[0]
      : riskScore >= 55
      ? TIME_HORIZONS[1]
      : TIME_HORIZONS[2];

  const reason =
    riskScore >= 75
      ? `The role of ${jobTitle} involves repetitive and structured tasks that AI systems can increasingly automate.`
      : riskScore >= 55
      ? `The role of ${jobTitle} will be significantly augmented by AI tools, though human oversight remains important.`
      : riskScore >= 35
      ? `The role of ${jobTitle} will collaborate with AI systems, improving productivity rather than replacing humans.`
      : `The role of ${jobTitle} depends heavily on human judgment, creativity, or physical presence, making automation unlikely in the near future.`;

  return {
    risk_score: riskScore,
    risk_level: riskLevel,
    automation_percentage: automationPercentage,
    time_horizon: timeHorizon,
    reason,
    future_skills: pickFutureSkills(riskScore % SKILL_LIBRARY.length),
    industry: inferIndustry(jobTitle),
  };
}
