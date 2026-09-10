/**
 * SAHAY AI Service Boundary (Phase 6)
 *
 * Exposes a clean, unified public interface for all GenAI / ML capabilities.
 */

import { createServerClient } from "@/lib/supabase/server";
import type { AIInsightsResult } from "./types";
import { generateGeminiCaseInsights } from "./gemini-provider";
import { evaluateSentimentAndEmotion } from "./local-nlp-fallback";
import { detectLanguage } from "./multilingual-dictionary";

export async function analyzeCheckInText(text: string) {
  const language = detectLanguage(text);
  const nlp = evaluateSentimentAndEmotion(text);

  return {
    language,
    sentiment: nlp.sentiment,
    emotionalTone: {
      primary: nlp.primaryEmotion,
      secondary: nlp.secondaryEmotion,
    },
    matchedCategories: nlp.matchedCategories,
  };
}

export async function generateCaseInsights(caseId: string): Promise<AIInsightsResult> {
  const supabase = await createServerClient();

  // 1. Fetch Case info
  const { data: caseItem, error: caseErr } = await supabase
    .from("cases")
    .select("id, case_ref, status, victim:profiles!cases_victim_id_fkey(display_name)")
    .eq("id", caseId)
    .single();

  if (caseErr || !caseItem) {
    throw new Error(`Case not found: ${caseId}`);
  }

  // 2. Fetch recent Check-Ins (up to 5 newest)
  const { data: checkInsData } = await supabase
    .from("check_ins")
    .select("response_text, submitted_at")
    .eq("case_id", caseId)
    .order("submitted_at", { ascending: false })
    .limit(5);

  // 3. Fetch recent Interactions (up to 5 newest)
  const { data: interactionsData } = await supabase
    .from("interactions")
    .select("channel, summary, occurred_at")
    .eq("case_id", caseId)
    .order("occurred_at", { ascending: false })
    .limit(5);

  // 4. Fetch recent Risk Scores (up to 5 newest)
  const { data: scoresData } = await supabase
    .from("risk_scores")
    .select("score, computed_at, signal_reason")
    .eq("case_id", caseId)
    .order("computed_at", { ascending: false })
    .limit(5);

  const victimName = (caseItem.victim as { display_name?: string } | null)?.display_name;

  const checkInTexts = (checkInsData || [])
    .map((c) => c.response_text)
    .filter((t): t is string => Boolean(t && t.trim().length > 0));

  const interactionSummaries = (interactionsData || [])
    .map((i) => `[${i.channel}]: ${i.summary || "No summary"}`);

  const riskScores = scoresData || [];

  return generateGeminiCaseInsights({
    caseRef: caseItem.case_ref,
    victimName,
    checkInTexts,
    interactionSummaries,
    riskScores,
  });
}
