import { z } from "zod";

export const aiRiskAssessmentSchema = z.object({
  riskLevel: z.enum(["low", "medium", "high", "critical", "unknown"]),
  score: z.number().min(-1).max(100),
  warnings: z.array(z.string()),
  recommendation: z.string(),
}).strict();

export type AIRiskAssessment = z.infer<typeof aiRiskAssessmentSchema>;

const SAFE_FALLBACK: AIRiskAssessment = {
  riskLevel: "unknown",
  score: -1,
  warnings: ["Risk analysis unavailable"],
  recommendation: "Proceed with caution",
};

/**
 * Validate and parse AI risk assessment response
 * Returns safe fallback if parsing fails
 */
export function validateAIResponse(response: unknown): AIRiskAssessment {
  try {
    return aiRiskAssessmentSchema.parse(response);
  } catch (error) {
    console.warn("Invalid AI response, using safe fallback:", error);
    return SAFE_FALLBACK;
  }
}

/**
 * Parse AI assessment and ensure it conforms to schema
 * Never render raw AI text - always render validated schema fields
 */
export function parseAIAssessment(rawResponse: string): AIRiskAssessment {
  try {
    const parsed = JSON.parse(rawResponse);
    return validateAIResponse(parsed);
  } catch {
    return SAFE_FALLBACK;
  }
}
