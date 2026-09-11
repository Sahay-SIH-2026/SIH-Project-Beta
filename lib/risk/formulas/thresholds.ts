export type DistortionSeverity =
  | "STABLE"
  | "CONCERN"
  | "ELEVATED"
  | "CRITICAL";

export function determineSeverityBand(score: number): DistortionSeverity {
  if (score >= 75) return "CRITICAL";
  if (score >= 50) return "ELEVATED";
  if (score >= 25) return "CONCERN";
  return "STABLE";
}

export function determineAlertSeverity(
  score: number,
  delta: number
): "LOW" | "MEDIUM" | "HIGH" | undefined {
  if (score >= 76 || delta >= 25) {
    return "HIGH";
  }
  if (score >= 51 || delta >= 15) {
    return "MEDIUM";
  }
  return undefined;
}
