const STOP_WORDS = new Set(["a", "an", "the", "of", "and", "for", "to", "in"]);

const INDUSTRY_MAP: Record<string, string> = {
  developer: "Technology",
  engineer: "Technology",
  scientist: "Research",
  analyst: "Business",
  teacher: "Education",
  professor: "Education",
  driver: "Transportation",
  nurse: "Healthcare",
  doctor: "Healthcare",
  designer: "Creative",
  accountant: "Finance",
  lawyer: "Legal",
  manager: "Management",
  marketer: "Marketing",
  salesperson: "Sales",
};

export function normalizeJobId(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[-\s]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function standardizedRoleName(input: string): string {
  const cleaned = input
    .replace(/[-_]+/g, " ")
    .replace(/[^a-zA-Z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

  if (!cleaned) {
    return "";
  }

  return cleaned
    .split(" ")
    .map((word) => {
      if (STOP_WORDS.has(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ")
    .replace(/^./, (char) => char.toUpperCase());
}

export function isRealisticProfession(input: string): boolean {
  const normalized = input
    .replace(/[-_]+/g, " ")
    .replace(/[^a-zA-Z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) return false;
  if (normalized.length < 3 || normalized.length > 60) return false;

  const words = normalized.split(" ").filter(Boolean);
  if (words.length > 6) return false;

  const hasAlphaWord = words.some((word) => /[a-zA-Z]{2,}/.test(word));
  const hasKnownRoleToken = words.some((word) => {
    const lower = word.toLowerCase();
    return (
      lower.endsWith("er") ||
      lower.endsWith("or") ||
      lower.endsWith("ist") ||
      lower.endsWith("ian") ||
      INDUSTRY_MAP[lower] !== undefined
    );
  });

  return hasAlphaWord && hasKnownRoleToken;
}

export function inferIndustry(jobTitle: string): string {
  const lower = jobTitle.toLowerCase();
  const matched = Object.keys(INDUSTRY_MAP).find((keyword) => lower.includes(keyword));
  return matched ? INDUSTRY_MAP[matched] : "General";
}
