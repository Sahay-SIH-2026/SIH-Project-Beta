/**
 * SAHAY Rule Engine — Deterministic Support Signal Evaluation
 *
 * Implements transparent, explainable feature extraction and weighted scoring.
 * Outputs decision-support distress prioritization indicators (0–100).
 */

import type {
  ContributingFactor,
  DistressLevel,
  EvaluationResult,
} from "./types";
import { calculateTrend } from "./trend-calculator";
import { generateInterventions } from "./intervention-engine";

interface RuleEngineInput {
  currentText: string;
  previousScores: number[]; // Most recent first
  daysSinceLastCheckIn: number;
}

import { MULTILINGUAL_LEXICON } from "@/lib/ai/multilingual-dictionary";

export function evaluateSignalRules(input: RuleEngineInput): EvaluationResult {
  const { currentText, previousScores, daysSinceLastCheckIn } = input;
  const lowerText = currentText.toLowerCase();

  const factors: ContributingFactor[] = [];
  let calculatedScore = 15; // Baseline monitoring value

  // 1. Multilingual Keyword Cluster Evaluation (English, Hindi, Hinglish)
  for (const [key, category] of Object.entries(MULTILINGUAL_LEXICON)) {
    const allWords = [
      ...category.english,
      ...category.hindi,
      ...category.hinglish,
    ];
    const matchedWords = allWords.filter((w) => lowerText.includes(w.toLowerCase()));
    if (matchedWords.length > 0) {
      factors.push({
        id: `factor-${key.toLowerCase()}`,
        category: key === "SAFETY_THREAT" ? "SAFETY" : "LINGUISTIC",
        label: category.label,
        description: `Text contains indicators: "${matchedWords.slice(0, 3).join('", "')}"`,
        type: "OBSERVED_FACT",
        scoreContribution: category.weight,
      });
      calculatedScore += category.weight;
    }
  }

  // 2. Disengagement / Inactivity Feature
  if (daysSinceLastCheckIn > 7) {
    const disengagementWeight = Math.min(20, Math.floor(daysSinceLastCheckIn * 2));
    factors.push({
      id: "factor-disengagement-high",
      category: "FREQUENCY",
      label: "Prolonged Inactivity",
      description: `${daysSinceLastCheckIn} days elapsed since previous check-in (exceeds 7-day schedule).`,
      type: "OBSERVED_FACT",
      scoreContribution: disengagementWeight,
    });
    calculatedScore += disengagementWeight;
  } else if (daysSinceLastCheckIn > 3) {
    factors.push({
      id: "factor-disengagement-moderate",
      category: "FREQUENCY",
      label: "Delayed Check-In",
      description: `${daysSinceLastCheckIn} days elapsed since previous check-in.`,
      type: "OBSERVED_FACT",
      scoreContribution: 8,
    });
    calculatedScore += 8;
  }

  // 3. Longitudinal Trend & Acceleration
  const trend = calculateTrend(previousScores, calculatedScore);
  if (trend.direction === "WORSENING" && trend.delta >= 20) {
    factors.push({
      id: "factor-rapid-escalation",
      category: "LONGITUDINAL",
      label: "Rapid Distress Escalation",
      description: `Support signal increased by +${trend.delta} points compared to previous evaluation.`,
      type: "SUPPORT_INFERENCE",
      scoreContribution: 12,
    });
    calculatedScore += 12;
  } else if (trend.direction === "IMPROVING" && trend.delta <= -15) {
    factors.push({
      id: "factor-distress-reduction",
      category: "LONGITUDINAL",
      label: "Downward Signal Trajectory",
      description: `Distress indicators decreased by ${Math.abs(trend.delta)} points compared to previous evaluation.`,
      type: "SUPPORT_INFERENCE",
      scoreContribution: -8,
    });
    calculatedScore -= 8;
  }

  // Normalize final score to [0, 100]
  const finalScore = Math.max(0, Math.min(100, Math.round(calculatedScore)));

  // Determine distress level
  let level: DistressLevel = "STABLE";
  if (finalScore >= 76) {
    level = "CRITICAL";
  } else if (finalScore >= 51) {
    level = "ELEVATED";
  } else if (finalScore >= 26) {
    level = "CONCERN";
  }

  // Alert Thresholds
  let alertTriggered = false;
  let alertSeverity: "LOW" | "MEDIUM" | "HIGH" | undefined;

  if (finalScore >= 75 || trend.delta >= 25) {
    alertTriggered = true;
    alertSeverity = "HIGH";
  } else if (finalScore >= 50 || trend.delta >= 15) {
    alertTriggered = true;
    alertSeverity = "MEDIUM";
  } else if (finalScore >= 35) {
    alertTriggered = true;
    alertSeverity = "LOW";
  }

  // Compose signal reason summary
  const reasonParts = factors
    .filter((f) => f.scoreContribution > 0)
    .map((f) => f.label);
  const signalReason =
    reasonParts.length > 0
      ? `${level} Priority: ${reasonParts.slice(0, 2).join(" & ")} observed.`
      : `${level} Priority: Routine periodic check-in with baseline indicators.`;

  // Confidence calculation based on text detail and interaction consistency
  let confidence = 75;
  if (currentText.length > 80) confidence += 10;
  if (currentText.length > 200) confidence += 5;
  if (previousScores.length >= 3) confidence += 5;
  confidence = Math.min(95, confidence);

  // Generate actionable intervention suggestions
  const suggestedInterventions = generateInterventions({
    score: finalScore,
    level,
    factors,
    trendDirection: trend.direction,
  });

  return {
    score: finalScore,
    level,
    confidence,
    signalReason,
    factors,
    trendDirection: trend.direction,
    trendDelta: trend.delta,
    alertTriggered,
    alertSeverity,
    suggestedInterventions,
  };
}
