/**
 * Mathematical formula for raw distress signal calculation.
 * Formula: S_raw = Clamp_0^100(15 + SUM(weights) + Disengagement - Protective)
 */

export const BASELINE_SCORE = 15;

export const CATEGORY_WEIGHTS: Record<string, number> = {
  SAFETY_THREAT: 30,
  SEVERE_DISTRESS: 25,
  HOUSING_INSTABILITY: 20,
  LEGAL_STRESS: 15,
  POSITIVE_PROTECTIVE: -15,
};

export function calculateRawScore(
  signals: string[],
  daysSinceLastCheckIn: number
): number {
  let score = BASELINE_SCORE;

  // Add weights based on signals extracted by AI
  for (const signal of signals) {
    if (CATEGORY_WEIGHTS[signal]) {
      score += CATEGORY_WEIGHTS[signal];
    }
  }

  // Disengagement penalty
  if (daysSinceLastCheckIn > 7) {
    score += 10;
  } else if (daysSinceLastCheckIn > 3) {
    score += 5;
  }

  // Clamp 0-100
  return Math.max(0, Math.min(100, Math.round(score)));
}
