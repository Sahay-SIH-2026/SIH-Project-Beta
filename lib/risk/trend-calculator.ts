/**
 * LUMA Trend Calculator — Longitudinal Signal Analysis
 */

import type { TrendDirection } from "./types";

export interface TrendAnalysis {
  direction: TrendDirection;
  delta: number;
  movingAverage: number;
}

export function calculateTrend(
  previousScores: number[], // index 0 is most recent
  currentScore: number
): TrendAnalysis {
  if (!previousScores || previousScores.length === 0) {
    return {
      direction: "STABLE",
      delta: 0,
      movingAverage: currentScore,
    };
  }

  const lastScore = previousScores[0];
  const delta = currentScore - lastScore;

  // Moving average of up to 4 most recent scores including current
  const window = [currentScore, ...previousScores.slice(0, 3)];
  const movingAverage = Math.round(
    window.reduce((sum, val) => sum + val, 0) / window.length
  );

  let direction: TrendDirection = "STABLE";

  // Check volatility (oscillating up and down significantly)
  if (previousScores.length >= 3) {
    const d1 = currentScore - previousScores[0];
    const d2 = previousScores[0] - previousScores[1];
    if ((d1 > 15 && d2 < -15) || (d1 < -15 && d2 > 15)) {
      direction = "VOLATILE";
      return { direction, delta, movingAverage };
    }
  }

  if (delta >= 12) {
    direction = "WORSENING";
  } else if (delta <= -12) {
    direction = "IMPROVING";
  } else {
    direction = "STABLE";
  }

  return {
    direction,
    delta,
    movingAverage,
  };
}

export function calculateLongitudinalTrend(
  scores: Array<{ score: number; timestamp?: string }>
): TrendAnalysis {
  if (!scores || scores.length === 0) {
    return {
      direction: "STABLE",
      delta: 0,
      movingAverage: 0,
    };
  }
  const current = scores[0].score;
  const previous = scores.slice(1).map((s) => s.score);
  return calculateTrend(previous, current);
}
