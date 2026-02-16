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

function deriveRiskLevel(score: number): RiskLevel {
  if (score <= 39) return "Low";
  if (score <= 69) return "Medium";
  return "High";
}

function pickFutureSkills(seed: number): string[] {
  const rotated = [...SKILL_LIBRARY.slice(seed), ...SKILL_LIBRARY.slice(0, seed)];
  return rotated.slice(0, 4);
}

export function generateRisk(jobTitle: string): GeneratedRisk {
  const lowerTitle = jobTitle.toLowerCase();

  const riskScore = lowerTitle.includes("developer")
    ? 40
    : lowerTitle.includes("driver")
      ? 80
      : lowerTitle.includes("teacher")
        ? 30
        : randomInt(35, 75);

  const riskLevel = deriveRiskLevel(riskScore);
  const automationPercentage = Math.min(95, Math.max(15, riskScore + randomInt(-8, 12)));
  const timeHorizon =
    riskScore >= 70 ? TIME_HORIZONS[0] : riskScore >= 40 ? TIME_HORIZONS[1] : TIME_HORIZONS[2];

  const reason = `The role of ${jobTitle} includes repetitive workflows that AI can increasingly support, but outcomes still depend on human judgment, coordination, and context.`;

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
