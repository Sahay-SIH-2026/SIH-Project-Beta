import { NextResponse } from "next/server";
import { generateCaseInsights } from "@/lib/ai/service";
import { evaluateSentimentAndEmotion } from "@/lib/ai/local-nlp-fallback";
import { detectLanguage } from "@/lib/ai/multilingual-dictionary";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { case_id, mode = "CASE_INSIGHTS", text } = body;

    // Mode 1: Quick Text Analysis
    if (mode === "TEXT_ANALYSIS") {
      if (!text || typeof text !== "string") {
        return NextResponse.json(
          { error: "text parameter is required for TEXT_ANALYSIS mode" },
          { status: 400 }
        );
      }

      const lang = detectLanguage(text);
      const nlp = evaluateSentimentAndEmotion(text);

      return NextResponse.json({
        mode: "TEXT_ANALYSIS",
        language: lang,
        nlp,
        isClinicalDiagnosis: false,
      });
    }

    // Mode 2: Comprehensive Case Insights (Default)
    if (!case_id) {
      return NextResponse.json(
        { error: "case_id parameter is required for CASE_INSIGHTS mode" },
        { status: 400 }
      );
    }

    const insights = await generateCaseInsights(case_id);
    return NextResponse.json({
      mode: "CASE_INSIGHTS",
      insights,
      stableBoundary: {
        provider: process.env.GEMINI_API_KEY ? "GOOGLE_GEMINI_2.5_FLASH" : "LOCAL_ML_FALLBACK",
        disclaimer: "Non-clinical decision support indicator only. Mandatory human review.",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to execute AI service interface";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
