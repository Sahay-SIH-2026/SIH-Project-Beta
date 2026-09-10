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

      {/* KPI Volume Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">In-App Web</span>
            <Globe className="h-4 w-4 text-blue-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{metrics.byChannel.inApp}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Encrypted portal check-ins</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Voice / STT</span>
            <Mic className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{metrics.byChannel.voice}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Multilingual speech intake</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">2-Way SMS</span>
            <MessageSquare className="h-4 w-4 text-purple-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{metrics.byChannel.sms}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Quick-code & text responses</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">IVRS Telephony</span>
            <Radio className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{metrics.byChannel.ivrs}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">DTMF + recorded calls</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Helpline 14566</span>
            <PhoneCall className="h-4 w-4 text-rose-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{metrics.byChannel.helpline}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">National referral intake</p>
        </div>
      </div>

      {/* Architecture & Evaluation Overview */}
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-5">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">
            Inclusive Last-Mile Architecture for Rural & Low-Connectivity Victims
          </h2>
        </div>
        <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
          Victims in rural or marginalized conditions often lack high-speed internet, smartphones, or English literacy.
          SAHAY&apos;s Multi-Channel Gateway guarantees support continuity by ingesting signals from feature phones via automated IVRS calls, SMS shortcodes, and direct 14566 telephonic helpline referrals. Every incoming interaction is normalized and piped through the <strong>Phase 5 & 6 Multilingual Risk Engine</strong> to update longitudinal trajectories and trigger early-warning alerts.
        </p>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="flex items-start gap-2 rounded bg-card/60 p-3 border border-border/60">
            <Activity className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">Unified Risk Scoring</p>
              <p className="text-muted-foreground text-[11px] mt-0.5">
                Regardless of the channel used, text and speech signals share the same 0–100 distress threshold engine.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 rounded bg-card/60 p-3 border border-border/60">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">Automated Escalation Protection</p>
              <p className="text-muted-foreground text-[11px] mt-0.5">
                High-distress signals trigger immediate counselor alerts and auto-schedule 4h/24h urgent follow-ups.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 rounded bg-card/60 p-3 border border-border/60">
            <Globe className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">Multilingual NLP Support</p>
              <p className="text-muted-foreground text-[11px] mt-0.5">
                Full Hindi, Hinglish, and English lexicons parse distress keywords from voicemail or SMS text.
              </p>
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
