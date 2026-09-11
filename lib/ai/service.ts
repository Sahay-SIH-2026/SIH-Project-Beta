/**
 * LUMA AI Service Boundary (Phase 6)
 *
 * Exposes a clean, unified public interface for all GenAI / ML capabilities.
 */

import { createServerClient } from "@/lib/supabase/server";
import type { AIInsightsResult } from "./types";
import { generateCaseInsightsWithOllama } from "./ollama";
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
    .from("interactions")
    .select("distress_score, occurred_at, distress_reason")
    .eq("case_id", caseId)
    .not("distress_score", "is", null)
    .order("occurred_at", { ascending: false })
    .limit(5);
    
  const { data: ciScoresData } = await supabase
    .from("check_ins")
    .select("distress_score, submitted_at, distress_reason")
    .eq("case_id", caseId)
    .not("distress_score", "is", null)
    .order("submitted_at", { ascending: false })
    .limit(5);

  const victimName = (caseItem.victim as { display_name?: string } | null)?.display_name;

  const checkInTexts = (checkInsData || [])
    .map((c) => c.response_text)
    .filter((t): t is string => Boolean(t && t.trim().length > 0));

  const interactionSummaries = (interactionsData || [])
    .map((i) => `[${i.channel}]: ${i.summary || "No summary"}`);

  // Combine interactions and check_ins scores chronologically for the AI to understand trajectory
  const combinedScores = [
    ...(scoresData || []).map(s => ({
      score: s.distress_score as number,
      computed_at: s.occurred_at,
      signal_reason: s.distress_reason || "Interaction analyzed"
    })),
    ...(ciScoresData || []).map(c => ({
      score: c.distress_score as number,
      computed_at: c.submitted_at,
      signal_reason: c.distress_reason || "Check-in analyzed"
    }))
  ].sort((a, b) => new Date(b.computed_at).getTime() - new Date(a.computed_at).getTime());

  return generateCaseInsightsWithOllama({
    caseRef: caseItem.case_ref,
    victimName,
    checkInTexts,
    interactionSummaries,
    riskScores: combinedScores.slice(0, 5),
  });
}
