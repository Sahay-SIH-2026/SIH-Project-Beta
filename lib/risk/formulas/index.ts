import { calculateRawScore } from "./raw-signal";
import { calculateTrajectory, type TrajectoryCalculation } from "./trajectory";
import { determineSeverityBand, determineAlertSeverity, type DistortionSeverity } from "./thresholds";

export interface DeterministicRiskResult {
  score: number;
  severity: DistortionSeverity;
  trajectory: TrajectoryCalculation;
  alertTriggered: boolean;
  alertSeverity?: "LOW" | "MEDIUM" | "HIGH";
}

export function evaluateDeterministicRisk(
  signals: string[],
  previousScores: number[],
  daysSinceLastCheckIn: number
): DeterministicRiskResult {
  const currentScore = calculateRawScore(signals, daysSinceLastCheckIn);
  
  // To calculate trajectory accurately, prepend current score to history
  const historyWithCurrent = [currentScore, ...previousScores];
  const trajectory = calculateTrajectory(historyWithCurrent);
  
  const severity = determineSeverityBand(currentScore);
  const alertSeverity = determineAlertSeverity(currentScore, trajectory.delta);

  return {
    score: currentScore,
    severity,
    trajectory,
    alertTriggered: !!alertSeverity,
    alertSeverity,
  };
}

export * from "./raw-signal";
export * from "./trajectory";
export * from "./thresholds";
