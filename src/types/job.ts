export type RiskLevel = "Low" | "Medium" | "High";

export interface JobAnalysis {
  jobId: string;
  jobTitle: string;
  industry: string;
  risk_score: number;
  risk_level: RiskLevel;
  automation_percentage: number;
  time_horizon: string;
  reason: string;
  future_skills: string[];
  createdAt: Date;
}

export interface GeneratedRisk {
  risk_score: number;
  risk_level: RiskLevel;
  automation_percentage: number;
  time_horizon: string;
  reason: string;
  future_skills: string[];
  industry: string;
}
