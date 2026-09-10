/**
 * SAHAY Local NLP & Heuristic ML Engine (Phase 6)
 *
 * Provides offline-capable, zero-network, deterministic natural language processing,
 * sentiment classification, emotion recognition, and 72-hour escalation forecasting.
 */

import type {
  AIInsightsResult,
  EmotionalTone,
  EscalationForecast,
  EscalationLevel,
  EscalationTrajectory,
  SentimentAnalysis,
  StructuredFactVsInference,
} from "./types";
import { MULTILINGUAL_LEXICON, detectLanguage } from "./multilingual-dictionary";

interface CaseSynthesisInput {
  caseRef: string;
  victimName?: string;
  checkInTexts: string[]; // Chronological (newest first)
  interactionSummaries: string[];
  riskScores: Array<{ score: number; computed_at: string; signal_reason: string }>;
}

/**
 * Evaluates sentiment polarity and emotional tone from text
 */
export function evaluateSentimentAndEmotion(text: string): {
  sentiment: SentimentAnalysis;
  primaryEmotion: EmotionalTone;
  secondaryEmotion?: EmotionalTone;
  matchedCategories: string[];
} {
  const lower = text.toLowerCase();
  let negativeScore = 0;
  let positiveScore = 0;
  const matchedCategories: string[] = [];

  for (const [key, category] of Object.entries(MULTILINGUAL_LEXICON)) {
    const allWords = [
      ...category.english,
      ...category.hindi,
      ...category.hinglish,
    ];
    const matches = allWords.filter((w) => lower.includes(w.toLowerCase()));
    if (matches.length > 0) {
      matchedCategories.push(key);
      if (category.weight > 0) {
        negativeScore += category.weight * matches.length;
      } else {
        positiveScore += Math.abs(category.weight) * matches.length;
      }
    }
  }

  // Determine sentiment polarity
  let polarity: "POSITIVE" | "NEUTRAL" | "NEGATIVE" = "NEUTRAL";
  let intensity = 30;

  if (negativeScore > positiveScore + 10) {
    polarity = "NEGATIVE";
    intensity = Math.min(95, Math.round(50 + negativeScore * 0.7));
  } else if (positiveScore > negativeScore + 5) {
    polarity = "POSITIVE";
    intensity = Math.min(90, Math.round(40 + positiveScore * 0.8));
  } else if (negativeScore > 0 || positiveScore > 0) {
    polarity = "NEUTRAL";
    intensity = 45;
  }

  // Determine Primary Emotional Tone
  let primaryEmotion: EmotionalTone = "ANXIETY";
  let secondaryEmotion: EmotionalTone | undefined;

  if (matchedCategories.includes("SAFETY_THREAT")) {
    primaryEmotion = "FEAR";
    secondaryEmotion = "ANXIETY";
  } else if (matchedCategories.includes("SEVERE_DISTRESS")) {
    primaryEmotion = "ANXIETY";
    secondaryEmotion = "SADNESS";
  } else if (matchedCategories.includes("POSITIVE_PROTECTIVE")) {
    primaryEmotion = positiveScore > 20 ? "RELIEF" : "HOPE";
  } else if (polarity === "NEGATIVE") {
    primaryEmotion = "SADNESS";
  } else {
    primaryEmotion = "HOPE";
  }

  return {
    sentiment: {
      polarity,
      intensity,
      confidence: Math.min(92, 70 + text.length > 50 ? 15 : 5),
    },
    primaryEmotion,
    secondaryEmotion,
    matchedCategories,
  };
}

/**
 * Computes 72-hour escalation projection based on multi-signal indicators
 */
export function projectEscalation(
  scores: number[],
  matchedCategories: string[],
  sentimentIntensity: number,
  polarity: string
): EscalationForecast {
  const latestScore = scores.length > 0 ? scores[0] : 20;
  const previousScore = scores.length > 1 ? scores[1] : latestScore;
  const delta = latestScore - previousScore;

  let level: EscalationLevel = "LOW";
  let trajectory: EscalationTrajectory = "STABLE";
  const leadingIndicators: string[] = [];

  // Trajectory analysis
  if (delta >= 15 || sentimentIntensity >= 80) {
    trajectory = "ACCELERATING";
  } else if (delta <= -12 || polarity === "POSITIVE") {
    trajectory = "DE-ESCALATING";
  } else {
    trajectory = "STABLE";
  }

  // Escalation Level
  if (
    matchedCategories.includes("SAFETY_THREAT") ||
    latestScore >= 75 ||
    (delta >= 20 && latestScore >= 55)
  ) {
    level = "CRITICAL";
    leadingIndicators.push("Direct safety concern or severe distress acceleration detected");
  } else if (latestScore >= 50 || delta >= 12) {
    level = "HIGH";
    leadingIndicators.push("Elevated distress score with upward velocity");
  } else if (latestScore >= 30 || matchedCategories.length > 0) {
    level = "MODERATE";
    leadingIndicators.push("Periodic stress indicators present; monitoring advised");
  } else {
    level = "LOW";
    leadingIndicators.push("Stable longitudinal baseline; low near-term disruption likelihood");
  }

  if (matchedCategories.includes("HOUSING_INSTABILITY")) {
    leadingIndicators.push("Housing vulnerability may exacerbate situational instability");
  }
  if (matchedCategories.includes("LEGAL_STRESS")) {
    leadingIndicators.push("Upcoming legal/procedural milestones identified");
  }

  const rationale =
    level === "CRITICAL"
      ? "Acute risk indicators suggest high probability of critical escalation within 72 hours if protective intervention is delayed."
      : level === "HIGH"
      ? "Distress signals show accelerating momentum across recent submissions. Priority check-in recommended within 24–48 hours."
      : level === "MODERATE"
      ? "Mild to moderate stress drivers present. Maintain scheduled continuity without emergency elevation."
      : "Longitudinal signals remain within manageable parameters with no acute triggers observed.";

  return {
    level,
    trajectory,
    timeframeHours: 72,
    leadingIndicators,
    rationale,
  };
}

/**
 * Generates structured case briefing, facts vs inferences, and suggested talking points
 */
export function generateLocalCaseInsights(input: CaseSynthesisInput): AIInsightsResult {
  const { checkInTexts, riskScores } = input;
  const latestText = checkInTexts.length > 0 ? checkInTexts[0] : "";
  const recentScores = riskScores.map((s) => s.score);

  // 1. Language detection
  const langInfo = detectLanguage(latestText);

  // 2. Sentiment & Emotion
  const nlp = evaluateSentimentAndEmotion(latestText);

  // 3. 72-Hour Escalation Projection
  const escalation = projectEscalation(
    recentScores,
    nlp.matchedCategories,
    nlp.sentiment.intensity,
    nlp.sentiment.polarity
  );

  // 4. Facts vs Inferences Separation
  const observedFacts: string[] = [];
  const supportInferences: string[] = [];

  if (latestText) {
    // Extract concrete factual statement
    const truncatedQuote =
      latestText.length > 120 ? `${latestText.slice(0, 117)}...` : latestText;
    observedFacts.push(`Victim submitted text: "${truncatedQuote}"`);
  } else {
    observedFacts.push("No check-in text submitted yet in the current period.");
  }

  if (nlp.matchedCategories.includes("SAFETY_THREAT")) {
    observedFacts.push("Linguistic safety and threat keywords identified in communication.");
    supportInferences.push("Heightened fear of physical intimidation or retaliation.");
  }
  if (nlp.matchedCategories.includes("HOUSING_INSTABILITY")) {
    observedFacts.push("Self-reported shelter or residential insecurity terms.");
    supportInferences.push("Environmental displacement is impeding emotional stabilization.");
  }
  if (nlp.matchedCategories.includes("LEGAL_STRESS")) {
    observedFacts.push("Court or police interaction referenced in recent contact.");
    supportInferences.push("Procedural anxiety regarding case progression or testimony.");
  }
  if (nlp.matchedCategories.includes("POSITIVE_PROTECTIVE")) {
    observedFacts.push("Protective relief markers or positive coping expressions identified.");
    supportInferences.push("Evidence of self-efficacy and stabilization in recent interactions.");
  }

  if (supportInferences.length === 0) {
    supportInferences.push("Routine monitoring status with no critical divergence from baseline.");
  }

  const factsVsInferences: StructuredFactVsInference = {
    observedFacts,
    supportInferences,
  };

  // 5. Narrative Case Summary (Counselor Briefing)
  let summary = "";
  if (!latestText) {
    summary = `Case ${input.caseRef} is undergoing routine longitudinal continuity tracking. Awaiting initial victim check-in for detailed linguistic synthesis.`;
  } else {
    const langNote =
      langInfo.language !== "en"
        ? ` (communicated in ${langInfo.label})`
        : "";
    summary = `Recent submission${langNote} reflects a ${nlp.sentiment.polarity.toLowerCase()} tone with primary indicators of ${nlp.primaryEmotion.toLowerCase()}. 72-hour support priority is currently ${escalation.level}. ${escalation.rationale}`;
  }

  // 6. Actionable Counselor Talking Points
  const suggestedTalkingPoints: string[] = [];
  if (nlp.matchedCategories.includes("SAFETY_THREAT")) {
    suggestedTalkingPoints.push(
      "Inquire discreetly about immediate physical safety and verify whether an updated security plan is needed."
    );
  }
  if (nlp.matchedCategories.includes("HOUSING_INSTABILITY")) {
    suggestedTalkingPoints.push(
      "Review safe shelter options and confirm stability of current temporary accommodations."
    );
  }
  if (nlp.matchedCategories.includes("LEGAL_STRESS")) {
    suggestedTalkingPoints.push(
      "Clarify next steps for upcoming court dates and offer a legal aid orientation follow-up."
    );
  }
  if (suggestedTalkingPoints.length === 0) {
    suggestedTalkingPoints.push(
      "Explore general daily routines, sleep quality, and reinforce open communication channels."
    );
    suggestedTalkingPoints.push(
      "Acknowledge recent progress and review scheduled support check-in cadence."
    );
  }

  return {
    summary,
    sentiment: nlp.sentiment,
    emotionalTone: {
      primary: nlp.primaryEmotion,
      secondary: nlp.secondaryEmotion,
      intensity: nlp.sentiment.intensity,
      confidence: nlp.sentiment.confidence,
    },
    multilingual: {
      detectedLanguage: langInfo.language,
      languageLabel: langInfo.label,
      confidence: langInfo.confidence,
      translatedGist:
        langInfo.language !== "en"
          ? `Gist: Core themes involve ${nlp.matchedCategories.join(", ") || "daily life status"}.`
          : undefined,
    },
    escalation,
    factsVsInferences,
    suggestedTalkingPoints,
    generatedAt: new Date().toISOString(),
    providerUsed: "LOCAL_HEURISTIC_ML",
  };
}
