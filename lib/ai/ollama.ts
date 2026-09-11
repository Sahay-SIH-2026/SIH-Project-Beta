import "server-only";

export interface OllamaAnalysis {
  immediate_danger: boolean;
  signals: string[];
  reason: string;
}

export async function analyzeCheckInWithOllama(text: string): Promise<OllamaAnalysis | null> {
  const prompt = `You are the specific distress parameter extraction component of LUMA.

Analyze ONLY the supplied victim check-in text.
Your job is to identify which qualitative parameter categories apply.

Return ONLY valid JSON in exactly this format:
{
  "immediate_danger": false,
  "signals": [],
  "reason": ""
}

Rules:
- Do not make a clinical diagnosis.
- Base the result only on the supplied text.
- Set immediate_danger=true only when the text clearly indicates immediate or potentially imminent danger.
- "signals" must ONLY contain an array of the following exact strings if they apply. Do not invent others.
  Categories:
  "SAFETY_THREAT" = Violence, ongoing physical harm, direct threats, stalking.
  "SEVERE_DISTRESS" = Panic, extreme emotional deterioration, active trauma responses.
  "HOUSING_INSTABILITY" = Eviction threats, shelter insecurity linked to the case.
  "LEGAL_STRESS" = Court-related panic, severe intimidation around testimony, police friction.
  "POSITIVE_PROTECTIVE" = Feeling safer, improvements, successful counseling, reduced fear.
- Return JSON only. No markdown.

Text:
"${text.replace(/"/g, '\\"')}"`;

  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "qwen3:8b",
        prompt: prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      console.error("Ollama API HTTP error:", response.status);
      return null;
    }

    const data = await response.json();
    if (!data || typeof data.response !== "string") {
      console.error("Ollama bad response format:", data);
      return null;
    }

    // Attempt to parse JSON safely if Ollama returned markdown blocks
    let jsonStr = data.response.trim();
    if (jsonStr.startsWith("```json")) {
      jsonStr = jsonStr.substring(7);
    }
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.substring(3);
    }
    if (jsonStr.endsWith("```")) {
      jsonStr = jsonStr.substring(0, jsonStr.length - 3);
    }
    jsonStr = jsonStr.trim();

    const analysis = JSON.parse(jsonStr) as OllamaAnalysis;
    
    // Validate minimal format
    if (analysis && Array.isArray(analysis.signals) && typeof analysis.immediate_danger === "boolean") {
      return analysis;
    }
    console.error("Ollama parsed JSON missing expected fields:", analysis);
    return null;
  } catch (err) {
    console.error("Ollama network or parsing error:", err);
    return null;
  }
}

import type { AIInsightsResult, CaseSynthesisInput } from "./types";
import { calculateTrajectory } from "@/lib/risk/formulas/trajectory";
import { generateLocalCaseInsights } from "./local-nlp-fallback";

export async function generateCaseInsightsWithOllama(
  input: CaseSynthesisInput
): Promise<AIInsightsResult> {
  // We use deterministic math for escalation projection
  const currentScores = input.riskScores.map(r => r.score);
  const mathTrajectory = currentScores.length > 0 
    ? calculateTrajectory(currentScores)
    : { direction: "STABLE", delta: 0, sma: 0 };
    
  let forcedLevel = "STABLE";
  if (currentScores[0] >= 75) forcedLevel = "CRITICAL";
  else if (currentScores[0] >= 50) forcedLevel = "HIGH";
  else if (currentScores[0] >= 25) forcedLevel = "MODERATE";

  const systemPrompt = `You are LUMA AI, an advanced decision-support engine assisting certified human counselors supporting victims of crime and domestic distress in India.

CRITICAL GUARDRAILS:
1. NEVER provide medical, psychiatric, or psychological diagnoses (e.g. do not diagnose "Depression", "PTSD", "Bipolar"). Frame all findings strictly as "Distress Prioritization Signals", "Emotional Tone Inferences", or "Support Indicators".
2. BIFURCATE FACTS AND INFERENCES:
   - "observedFacts": Direct quotes, verbatim excerpts, documented dates/events, and concrete self-reports.
   - "supportInferences": Predictive risk drivers, emotional hypotheses, and support needs.
3. MULTILINGUAL RECOGNITION: The text may be in English, Devanagari Hindi (हिन्दी), or Hinglish (Romanized Hindi). Analyze sentiment and tone accurately regardless of language and provide a brief English translation gist if non-English.
4. Provide 2-3 discreet, empathetic, practical counselor talking points.

Return your response strictly as valid JSON conforming to this schema (do NOT use markdown blocks, just raw JSON):
{
  "summary": "Concise 2-3 sentence counselor briefing.",
  "sentiment": { "polarity": "POSITIVE"|"NEUTRAL"|"NEGATIVE", "intensity": 0-100, "confidence": 0-100 },
  "emotionalTone": { "primary": "ANXIETY"|"FEAR"|"HOPE"|"NUMB"|"SADNESS"|"RELIEF"|"ANGER", "secondary": null, "intensity": 0-100, "confidence": 0-100 },
  "multilingual": { "detectedLanguage": "en"|"hi"|"hinglish", "languageLabel": "English/Hindi/Hinglish", "confidence": 0-100, "translatedGist": "gist or null" },
  "factsVsInferences": {
    "observedFacts": ["fact 1"],
    "supportInferences": ["inference 1"]
  },
  "suggestedTalkingPoints": ["point 1"]
}
`;

  const userPrompt = `
Case Reference: ${input.caseRef}
Victim Name: ${input.victimName || "Confidential"}
Recent Check-In Submissions (newest first):
${input.checkInTexts.length > 0 ? input.checkInTexts.map((t, idx) => `[Entry ${idx + 1}]: ${t}`).join("\n") : "(No check-in text available)"}

Recent Multi-Channel Interactions:
${input.interactionSummaries.length > 0 ? input.interactionSummaries.map((s, idx) => `[Contact ${idx + 1}]: ${s}`).join("\n") : "(No logged interactions)"}
`;

  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "qwen3:8b",
        system: systemPrompt,
        prompt: userPrompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      console.warn("Ollama API returned status", response.status);
      return generateLocalCaseInsights(input);
    }

    const data = await response.json();
    let jsonStr = data.response.trim();
    if (jsonStr.startsWith("\`\`\`json")) jsonStr = jsonStr.substring(7);
    if (jsonStr.startsWith("\`\`\`")) jsonStr = jsonStr.substring(3);
    if (jsonStr.endsWith("\`\`\`")) jsonStr = jsonStr.substring(0, jsonStr.length - 3);
    jsonStr = jsonStr.trim();

    const parsed = JSON.parse(jsonStr);
    
    // Merge AI extracted text with Deterministic Math Escalation
    return {
      summary: parsed.summary || "Case continuity synthesis generated.",
      sentiment: parsed.sentiment || { polarity: "NEUTRAL", intensity: 50, confidence: 80 },
      emotionalTone: parsed.emotionalTone || { primary: "ANXIETY", intensity: 50, confidence: 80 },
      multilingual: parsed.multilingual || { detectedLanguage: "en", languageLabel: "English", confidence: 90 },
      escalation: {
        level: forcedLevel as any,
        trajectory: mathTrajectory.direction.replace("VOLATILE", "STABLE").replace("INSUFFICIENT_DATA", "STABLE") as any,
        timeframeHours: 72,
        leadingIndicators: input.riskScores.slice(0,2).map(r => r.signal_reason).filter(Boolean),
        rationale: "Merged deterministic trajectory rules applied."
      },
      factsVsInferences: parsed.factsVsInferences || { observedFacts: [], supportInferences: [] },
      suggestedTalkingPoints: parsed.suggestedTalkingPoints || [],
      generatedAt: new Date().toISOString(),
      providerUsed: "LOCAL_OLLAMA",
    };
  } catch (error) {
    console.error("Error invoking Ollama API:", error);
    return generateLocalCaseInsights(input);
  }
}
