/**
 * SAHAY Intervention Engine — Decision-Support Recommendations
 *
 * NOTE: Interventions are strictly suggestions for human counselor review.
 * No intervention is ever triggered autonomously.
 */

import type {
  ContributingFactor,
  DistressLevel,
  SuggestedIntervention,
  TrendDirection,
} from "./types";

interface RecommendationInput {
  score: number;
  level: DistressLevel;
  factors: ContributingFactor[];
  trendDirection: TrendDirection;
}

export function generateInterventions(
  input: RecommendationInput
): SuggestedIntervention[] {
  const { score, level, factors, trendDirection } = input;
  const recommendations: SuggestedIntervention[] = [];

  const hasSafetyThreat = factors.some((f) => f.category === "SAFETY");
  const hasHousingInstability = factors.some(
    (f) => f.id === "factor-housing_instability"
  );
  const hasLegalStress = factors.some((f) => f.id === "factor-legal_stress");
  const hasSevereDistress = factors.some((f) => f.id === "factor-severe_distress");
  const hasInactivity = factors.some((f) => f.category === "FREQUENCY");

  // 1. Safety & Witness Protection Review
  if (hasSafetyThreat) {
    recommendations.push({
      id: "rec-witness-protection",
      type: "WITNESS_PROTECTION_REVIEW",
      title: "Security & Witness Protection Review",
      urgency: score >= 70 ? "URGENT" : "PRIORITY",
      reason:
        "Threat or intimidation indicators detected in recent communication. Assess necessity of protective measures or police liaison.",
      supportingSignals: ["Linguistic keywords: Safety threats / intimidation reported"],
    });
  }

  // 2. Emergency Housing / Relocation Assistance
  if (hasHousingInstability) {
    recommendations.push({
      id: "rec-housing",
      type: "HOUSING_RELOCATION",
      title: "Emergency Housing / Shelter Placement",
      urgency: score >= 60 ? "PRIORITY" : "ROUTINE",
      reason:
        "Housing insecurity or temporary shelter instability reported. Coordinate with district social welfare partner for accommodation aid.",
      supportingSignals: ["Self-reported housing instability / shelter need"],
    });
  }

  // 3. Legal Aid Consultation
  if (hasLegalStress) {
    recommendations.push({
      id: "rec-legal-aid",
      type: "LEGAL_AID_REFERRAL",
      title: "Legal Aid & Court Accompaniment",
      urgency: "ROUTINE",
      reason:
        "Court appearance or investigation proceedings mentioned. Review availability of legal counsel assistance and victim advocate support.",
      supportingSignals: ["Active court proceedings / legal apprehension mentioned"],
    });
  }

  // 4. Urgent Wellness / Counseling Check
  if (hasSevereDistress || level === "CRITICAL" || trendDirection === "WORSENING") {
    recommendations.push({
      id: "rec-counseling-priority",
      type: "PSYCHOSOCIAL_COUNSELING",
      title: "Prioritized Counselor One-on-One Session",
      urgency: level === "CRITICAL" ? "URGENT" : "PRIORITY",
      reason:
        "Significant distress signal elevation or worsening trend noted. A dedicated support session is recommended within 24–48 hours.",
      supportingSignals: [
        `Distress score ${score}/100 (${level})`,
        trendDirection === "WORSENING" ? "Worsening longitudinal trend" : "Elevated stress markers",
      ],
    });
  }

  // 5. Outreach on Prolonged Disengagement
  if (hasInactivity && !hasSafetyThreat) {
    recommendations.push({
      id: "rec-wellness-outreach",
      type: "EMERGENCY_WELLNESS_CHECK",
      title: "Proactive Follow-Up Call",
      urgency: "ROUTINE",
      reason:
        "Multiple check-in intervals elapsed without contact. Perform gentle telephonic wellness check.",
      supportingSignals: ["Inactivity exceeding standard monitoring frequency"],
    });
  }

  return recommendations;
}
