/**
 * SAHAY Risk Engine — Core Types
 *
 * NOTE: All types describe Decision-Support Prioritization Signals.
 * SAHAY does NOT make clinical diagnoses or psychological evaluations.
 */

export type DistressLevel = "STABLE" | "CONCERN" | "ELEVATED" | "CRITICAL";

export type TrendDirection = "IMPROVING" | "STABLE" | "WORSENING" | "VOLATILE";

export type FactorType = "OBSERVED_FACT" | "SUPPORT_INFERENCE";

export interface ContributingFactor {
  id: string;
  category: "LINGUISTIC" | "FREQUENCY" | "LONGITUDINAL" | "SAFETY";
  label: string;
  description: string;
  type: FactorType;
  scoreContribution: number;
}

export type InterventionType =
  | "PSYCHOSOCIAL_COUNSELING"
  | "LEGAL_AID_REFERRAL"
  | "HOUSING_RELOCATION"
  | "WITNESS_PROTECTION_REVIEW"
  | "MEDICAL_EVALUATION"
  | "EMERGENCY_WELLNESS_CHECK";

export interface SuggestedIntervention {
  id: string;
  type: InterventionType;
  title: string;
  urgency: "ROUTINE" | "PRIORITY" | "URGENT";
  reason: string;
  supportingSignals: string[];
}

export interface EvaluationResult {
  score: number; // 0 to 100
  level: DistressLevel;
  confidence: number; // 0 to 100
  signalReason: string;
  factors: ContributingFactor[];
  trendDirection: TrendDirection;
  trendDelta: number; // change compared to previous score
  alertTriggered: boolean;
  alertSeverity?: "LOW" | "MEDIUM" | "HIGH";
  suggestedInterventions: SuggestedIntervention[];
}
