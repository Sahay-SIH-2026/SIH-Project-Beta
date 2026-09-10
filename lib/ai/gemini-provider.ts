/**
 * SAHAY Gemini 2.5 Flash Provider (Phase 6)
 *
 * Calls Google Gemini API for structured decision-support case synthesis.
 * Enforces non-clinical framing, fact/inference bifurcation, and schema output.
 */

import type { AIInsightsResult } from "./types";
import { generateLocalCaseInsights } from "./local-nlp-fallback";

interface CaseSynthesisInput {
  caseRef: string;
  victimName?: string;
  checkInTexts: string[];
  interactionSummaries: string[];
  riskScores: Array<{ score: number; computed_at: string; signal_reason: string }>;
}

const GEMINI_SYSTEM_PROMPT = `
You are SAHAY AI, an advanced decision-support engine assisting certified human counselors supporting victims of crime and domestic distress in India.

CRITICAL GUARDRAILS:
1. NEVER provide medical, psychiatric, or psychological diagnoses (e.g. do not diagnose "Depression", "PTSD", "Bipolar"). Frame all findings strictly as "Distress Prioritization Signals", "Emotional Tone Inferences", or "Support Indicators".
2. BIFURCATE FACTS AND INFERENCES:
   - "observedFacts": Direct quotes, verbatim excerpts, documented dates/events, and concrete self-reports.
   - "supportInferences": Predictive risk drivers, emotional hypotheses, and support needs.
3. PROJECT 72-HOUR ESCALATION:
   - Level: "LOW" | "MODERATE" | "HIGH" | "CRITICAL"
   - Trajectory: "STABLE" | "ACCELERATING" | "DE-ESCALATING"
4. MULTILINGUAL RECOGNITION: The text may be in English, Devanagari Hindi (हिन्दी), or Hinglish (Romanized Hindi). Analyze sentiment and tone accurately regardless of language and provide a brief English translation gist if non-English.
5. Provide 2-3 discreet, empathetic, practical counselor talking points.

Return your response strictly as valid JSON conforming to this TypeScript interface:
{
  "summary": string,
  "sentiment": {
    "polarity": "POSITIVE" | "NEUTRAL" | "NEGATIVE",
    "intensity": number (0-100),
    "confidence": number (0-100)
  },
  "emotionalTone": {
    "primary": "ANXIETY" | "FEAR" | "HOPE" | "NUMB" | "SADNESS" | "RELIEF" | "ANGER",
    "secondary": "ANXIETY" | "FEAR" | "HOPE" | "NUMB" | "SADNESS" | "RELIEF" | "ANGER" (or null),
    "intensity": number (0-100),
    "confidence": number (0-100)
  },
  "multilingual": {
    "detectedLanguage": "en" | "hi" | "hinglish",
    "languageLabel": string,
    "confidence": number (0-100),
    "translatedGist": string (or null)
  },
  "escalation": {
    "level": "LOW" | "MODERATE" | "HIGH" | "CRITICAL",
    "trajectory": "STABLE" | "ACCELERATING" | "DE-ESCALATING",
    "timeframeHours": 72,
    "leadingIndicators": string[],
    "rationale": string
  },
  "factsVsInferences": {
    "observedFacts": string[],
    "supportInferences": string[]
  },
  "suggestedTalkingPoints": string[]
}
`;

export async function generateGeminiCaseInsights(
  input: CaseSynthesisInput
): Promise<AIInsightsResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  // Gracefully use local engine if no API key is set
  if (!apiKey) {
    return generateLocalCaseInsights(input);
  }

  try {
    const userPrompt = `
Case Reference: ${input.caseRef}
Victim Name: ${input.victimName || "Confidential"}
Recent Check-In Submissions (newest first):
${input.checkInTexts.length > 0 ? input.checkInTexts.map((t, idx) => `[Entry ${idx + 1}]: ${t}`).join("\n") : "(No check-in text available)"}

Recent Multi-Channel Interactions:
${input.interactionSummaries.length > 0 ? input.interactionSummaries.map((s, idx) => `[Contact ${idx + 1}]: ${s}`).join("\n") : "(No logged interactions)"}

Longitudinal Risk Scores (newest first):
${input.riskScores.length > 0 ? input.riskScores.map((r) => `Score: ${r.score}/100 at ${r.computed_at} (Reason: ${r.signal_reason})`).join("\n") : "(No recorded risk scores)"}

Please evaluate this victim continuity profile and return the structured JSON decision-support dossier.
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: GEMINI_SYSTEM_PROMPT }],
          },
          contents: [
            {
              role: "user",
              parts: [{ text: userPrompt }],
            },
          ],
          generationConfig: {
            response_mime_type: "application/json",
            temperature: 0.2,
          },
        }),
      }
    );

    if (!response.ok) {
      console.warn(`Gemini API returned status ${response.status}. Falling back to local NLP.`);
      return generateLocalCaseInsights(input);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      return generateLocalCaseInsights(input);
    }

    const parsed = JSON.parse(rawText);
    return {
      summary: parsed.summary || "Case continuity synthesis generated.",
      sentiment: parsed.sentiment || { polarity: "NEUTRAL", intensity: 50, confidence: 80 },
      emotionalTone: parsed.emotionalTone || { primary: "ANXIETY", intensity: 50, confidence: 80 },
      multilingual: parsed.multilingual || { detectedLanguage: "en", languageLabel: "English", confidence: 90 },
      escalation: parsed.escalation || {
        level: "MODERATE",
        trajectory: "STABLE",
        timeframeHours: 72,
        leadingIndicators: [],
        rationale: "Ongoing monitoring advised.",
      },
      factsVsInferences: parsed.factsVsInferences || {
        observedFacts: [],
        supportInferences: [],
      },
      suggestedTalkingPoints: parsed.suggestedTalkingPoints || [],
      generatedAt: new Date().toISOString(),
      providerUsed: "GEMINI_2_5_FLASH",
    };
  } catch (error) {
    console.error("Error invoking Gemini API:", error);
    return generateLocalCaseInsights(input);
  }
}
