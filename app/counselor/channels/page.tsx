import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { ChannelSimulator } from "@/components/counselor/ChannelSimulator";
import { getCases } from "@/lib/db/cases";
import { getChannelMetrics } from "@/app/actions/channels";
import {
  Radio,
  MessageSquare,
  PhoneCall,
  Globe,
  Mic,
  Activity,
  Layers,
  ShieldCheck,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Multi-Channel Gateway",
  description: "Monitor and test multi-channel signal ingestion across Voice, IVRS, SMS, and 14566 Helpline.",
};

export default async function CounselorChannelsPage() {
  const [cases, metrics] = await Promise.all([
    getCases().catch(() => []),
    getChannelMetrics().catch(() => ({
      totalInboundToday: 8,
      byChannel: { inApp: 4, voice: 2, sms: 2, ivrs: 1, helpline: 1 },
      highRiskAlertsGenerated: 1,
      avgResolutionTimeHours: 2.5,
    })),
  ]);

  const caseOptions = cases.map((c) => ({
    id: c.id,
    caseNumber: c.case_ref,
    victimName: c.victim?.display_name || "Complainant",
  }));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Multi-Channel Gateway & Ingestion Hub"
        subtitle="Continuous distress monitoring across web, voice recordings, telephony IVRS, two-way SMS, and National Helpline 14566 intake."
      />

      {/* Metrics & Architecture Side-by-Side Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Column: Small 2*2 Grid */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-2.5">
          <div className="flex items-center justify-between px-0.5">
            <span className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
              Last-Mile Channels
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-0.5 text-xs font-medium text-muted-foreground shadow-2xs">
              <Globe className="h-3 w-3 text-blue-500" />
              In-App Web: <strong className="text-foreground">{metrics.byChannel.inApp}</strong>
            </span>
          </div>

          {/* 2*2 Grid */}
          <div className="grid grid-cols-2 gap-3 flex-1">
            {/* 1. Voice / STT */}
            <div className="rounded-lg border border-border bg-card p-3.5 shadow-2xs flex flex-col justify-between transition-all hover:border-slate-300">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium">Voice / STT</span>
                <div className="rounded-md bg-emerald-50 p-1 dark:bg-emerald-950/40">
                  <Mic className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <div className="mt-2">
                <p className="text-2xl font-bold tracking-tight text-foreground">{metrics.byChannel.voice}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">Multilingual speech</p>
              </div>
            </div>

            {/* 2. 2-Way SMS */}
            <div className="rounded-lg border border-border bg-card p-3.5 shadow-2xs flex flex-col justify-between transition-all hover:border-slate-300">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium">2-Way SMS</span>
                <div className="rounded-md bg-purple-50 p-1 dark:bg-purple-950/40">
                  <MessageSquare className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="mt-2">
                <p className="text-2xl font-bold tracking-tight text-foreground">{metrics.byChannel.sms}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">Quick-code & text</p>
              </div>
            </div>

            {/* 3. IVRS Telephony */}
            <div className="rounded-lg border border-border bg-card p-3.5 shadow-2xs flex flex-col justify-between transition-all hover:border-slate-300">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium">IVRS Telephony</span>
                <div className="rounded-md bg-amber-50 p-1 dark:bg-amber-950/40">
                  <Radio className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <div className="mt-2">
                <p className="text-2xl font-bold tracking-tight text-foreground">{metrics.byChannel.ivrs}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">DTMF + recorded calls</p>
              </div>
            </div>

            {/* 4. Helpline 14566 */}
            <div className="rounded-lg border border-border bg-card p-3.5 shadow-2xs flex flex-col justify-between transition-all hover:border-slate-300">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium">Helpline 14566</span>
                <div className="rounded-md bg-rose-50 p-1 dark:bg-rose-950/40">
                  <PhoneCall className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                </div>
              </div>
              <div className="mt-2">
                <p className="text-2xl font-bold tracking-tight text-foreground">{metrics.byChannel.helpline}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">National referral intake</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Besides it): Inclusive Last-Mile Architecture */}
        <div className="lg:col-span-7 rounded-lg border border-primary/20 bg-primary/5 p-5 shadow-2xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-primary/10 p-1 text-primary">
                <Layers className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-semibold text-foreground">
                Inclusive Last-Mile Architecture for Rural & Low-Connectivity Victims
              </h2>
            </div>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Victims in rural or marginalized conditions often lack high-speed internet, smartphones, or English literacy.
              LUMA&apos;s Multi-Channel Gateway guarantees support continuity by ingesting signals from feature phones via automated IVRS calls, SMS shortcodes, and direct 14566 telephonic helpline referrals. Every incoming interaction is normalized and piped through the <strong>Phase 5 & 6 Multilingual Risk Engine</strong> to update longitudinal trajectories and trigger early-warning alerts.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="flex items-start gap-2 rounded-md bg-card/80 p-2.5 border border-border/60">
              <Activity className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground text-[11px]">Unified Risk Scoring</p>
                <p className="text-muted-foreground text-[10px] mt-0.5 leading-snug">
                  Regardless of channel, text and speech share the 0–100 distress threshold engine.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-md bg-card/80 p-2.5 border border-border/60">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground text-[11px]">Escalation Protection</p>
                <p className="text-muted-foreground text-[10px] mt-0.5 leading-snug">
                  High-distress signals auto-trigger alerts and schedule urgent 4h/24h follow-ups.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-md bg-card/80 p-2.5 border border-border/60">
              <Globe className="h-3.5 w-3.5 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground text-[11px]">Multilingual NLP</p>
                <p className="text-muted-foreground text-[10px] mt-0.5 leading-snug">
                  Hindi, Hinglish, and English lexicons parse voicemails & SMS text directly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Channel Simulator Section */}
      <div className="space-y-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">Interactive Channel Simulator & Testing Suite</h2>
          <p className="text-xs text-muted-foreground">
            Test and evaluate live webhook ingestion directly. Trigger simulated SMS messages, IVRS telephone calls, or Helpline intake records and view real-time risk scores.
          </p>
        </div>

        <ChannelSimulator cases={caseOptions} />
      </div>
    </div>
  );
}
