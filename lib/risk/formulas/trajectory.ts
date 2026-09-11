export type TrendDirection =
  | "IMPROVING"
  | "STABLE"
  | "WORSENING"
  | "VOLATILE"
  | "INSUFFICIENT_DATA";

export interface TrajectoryCalculation {
  sma: number;
  delta: number;
  direction: TrendDirection;
}

/**
 * Calculates a 3-period Simple Moving Average and subsequent trend indicators.
 * @param scores Array of scores sorted by newest first (index 0 is current).
 */
export function calculateTrajectory(scores: number[]): TrajectoryCalculation {
  if (scores.length < 2) {
    return {
      sma: scores[0] || 0,
      delta: 0,
      direction: "INSUFFICIENT_DATA",
    };
  }

  // 3-period SMA for current
  const currentWindow = Math.min(3, scores.length);
  const currentSma =
    scores.slice(0, currentWindow).reduce((sum, score) => sum + score, 0) /
    currentWindow;

  // 3-period SMA for previous
  const prevScores = scores.slice(1);
  const prevWindow = Math.min(3, prevScores.length);
  const prevSma =
    prevScores.slice(0, prevWindow).reduce((sum, score) => sum + score, 0) /
    prevWindow;

  const delta = Math.round(currentSma - prevSma);
  const currentScore = scores[0];

  let direction: TrendDirection = "STABLE";

  // Check volatility (Variance > 30 within 5 days, approximated as last 5 scores difference)
  const window5 = scores.slice(0, 5);
  const minScore = Math.min(...window5);
  const maxScore = Math.max(...window5);
  if (maxScore - minScore > 30 && window5.length >= 2) {
    direction = "VOLATILE";
  } else if (delta >= 15 && currentScore >= 76) {
    direction = "WORSENING";
  } else if (delta <= -10 && currentScore < 50) {
    direction = "IMPROVING";
  } else if (Math.abs(delta) < 10) {
    direction = "STABLE";
  } else if (delta > 0) {
    direction = "WORSENING";
  } else {
    direction = "STABLE"; // fallback
  }

  return {
    sma: Math.round(currentSma),
    delta,
    direction,
  };
}
