/**
 * LUMA GenAI / ML Types & Data Models (Phase 6)
 *
 * Enforces strict decision-support and non-clinical framing.
 * Diagnostic labels are prohibited.
 */

export type SentimentPolarity = "POSITIVE" | "NEUTRAL" | "NEGATIVE";

export type EmotionalTone =
  | "ANXIETY"
  | "FEAR"
  | "HOPE"
  | "NUMB"
  | "SADNESS"
  | "RELIEF"
  | "ANGER";

export type EscalationLevel = "LOW" | "MODERATE" | "HIGH" | "CRITICAL";

export type EscalationTrajectory = "STABLE" | "ACCELERATING" | "DE-ESCALATING";

export type SupportedLanguage = "en" | "hi" | "hinglish";

export interface MultilingualInfo {
  detectedLanguage: SupportedLanguage;
  languageLabel: string;
  confidence: number; // 0–100
  translatedGist?: string; // English translation/gist if input was Hindi or Hinglish
}

export interface StructuredFactVsInference {
  observedFacts: string[]; // Verbatim statements, timestamps, concrete documented events
  supportInferences: string[]; // Machine interpretations, risk drivers, hypothetical factors
}

export interface EscalationForecast {
  level: EscalationLevel;
  trajectory: EscalationTrajectory;
  timeframeHours: number; // e.g., 72
  leadingIndicators: string[];
  rationale: string;
}

export interface SentimentAnalysis {
  polarity: SentimentPolarity;
  intensity: number; // 0–100
  confidence: number; // 0–100
}

export interface EmotionalToneAnalysis {
  primary: EmotionalTone;
  secondary?: EmotionalTone;
  intensity: number; // 0–100
  confidence: number; // 0–100
}

export interface AIInsightsResult {
  summary: string; // Concise 2-3 sentence counselor briefing
  sentiment: SentimentAnalysis;
  emotionalTone: EmotionalToneAnalysis;
  multilingual: MultilingualInfo;
  escalation: EscalationForecast;
  factsVsInferences: StructuredFactVsInference;
  suggestedTalkingPoints: string[]; // 2-3 actionable counselor conversation topics
  generatedAt: string; // ISO timestamp
  providerUsed: "GEMINI_2_5_FLASH" | "LOCAL_HEURISTIC_ML";
}
