import { inferIndustry } from "@/lib/jobUtils";

export type GeminiRoleValidation = {
  is_valid: boolean;
  standardized_role: string;
  industry: string;
};

type GeminiApiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};

function extractJsonBlock(input: string): string {
  const trimmed = input.trim();
  if (trimmed.startsWith("```") && trimmed.endsWith("```")) {
    return trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  }
  return trimmed;
}

function getGeminiApiKey(): string {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!key) {
    throw new Error("Missing GEMINI_API_KEY (or GOOGLE_API_KEY) in environment variables");
  }
  return key;
}

export async function validateAndStandardizeRoleWithGemini(rawInput: string): Promise<GeminiRoleValidation> {
  const apiKey = getGeminiApiKey();

  const prompt = [
    "You are a strict profession normalizer.",
    "Given user input, decide if it is a realistic profession/job role.",
    "If valid, convert to a concise standardized role title.",
    "Return ONLY JSON with keys: is_valid (boolean), standardized_role (string), industry (string).",
    "If invalid, set is_valid=false and standardized_role=\"\".",
    "No markdown. No extra text.",
    `Input: ${rawInput}`,
  ].join("\n");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.1,
          },
        }),
        cache: "no-store",
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`Gemini validation request failed (${response.status}): ${body.slice(0, 220)}`);
    }

    const data = (await response.json()) as GeminiApiResponse;
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    if (!text) {
      throw new Error("Gemini validation response was empty");
    }

    const parsed = JSON.parse(extractJsonBlock(text)) as Partial<GeminiRoleValidation>;
    const standardizedRole = (parsed.standardized_role ?? "").trim();
    const industry = (parsed.industry ?? "").trim() || inferIndustry(standardizedRole || rawInput);

    return {
      is_valid: Boolean(parsed.is_valid),
      standardized_role: standardizedRole,
      industry,
    };
  } finally {
    clearTimeout(timeout);
  }
}
