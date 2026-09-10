import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { DemoStudio } from "@/components/counselor/DemoStudio";
import { getCases } from "@/lib/db/cases";
import { Sparkles, Award, ShieldCheck, Compass } from "lucide-react";

export const metadata: Metadata = {
  title: "Demo Studio — SIH26094",
  description: "Interactive presentation studio executing the 4 canonical victim monitoring scenarios for hackathon evaluation.",
};

export default async function CounselorDemoPage() {
  const cases = await getCases().catch(() => []);

  const caseOptions = cases.map((c) => ({
    id: c.id,
    caseNumber: c.case_ref,
    victimName: c.victim?.display_name || "Complainant",
  }));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Hackathon Demo Studio — SIH26094"
        subtitle="1-Click Interactive Evaluation Suite: Trigger canonical victim support scenarios and observe live Risk Engine calculations."
      />

      {/* Evaluator Explanatory Banner */}
      <div className="rounded-lg border border-primary/25 bg-primary/5 p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">
            SIH-26094 Evaluation Guide for Presentation & Judging
          </h2>
        </div>
        <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
          In longitudinal victim support, real-world check-ins happen across weeks or months. This <strong>Demo Studio</strong> simulates the complete life-cycle of dynamic distress prediction within seconds, proving compliance with all problem requirements:
        </p>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="flex items-start gap-2 rounded bg-card/70 p-3 border border-border/60">
            <Sparkles className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">Multilingual NLP in Action</p>
              <p className="text-muted-foreground text-[11px] mt-0.5">
                Scenarios feed genuine colloquial Hindi and Hinglish inputs, proving cross-lingual lexicon accuracy.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 rounded bg-card/70 p-3 border border-border/60">
            <Compass className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">Explainable Trend Delta</p>
              <p className="text-muted-foreground text-[11px] mt-0.5">
                Watch the 0–100 score compute moving average deltas and distinguish Observed Facts from Machine Inferences.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 rounded bg-card/70 p-3 border border-border/60">
            <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">Human-in-the-Loop Safeguard</p>
              <p className="text-muted-foreground text-[11px] mt-0.5">
                Critical threats trigger automated counselor callback tasks while strictly avoiding autonomous clinical diagnosis.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Scenario Cards */}
      <DemoStudio cases={caseOptions} />
    </div>
  );
}
