"use client";

import { useState } from "react";
import {
  simulateSMSAction,
  simulateIVRSAction,
  simulateHelplineAction,
} from "@/app/actions/channels";
import type { ChannelIngestionResult } from "@/lib/channels/types";
import {
  MessageSquare,
  PhoneCall,
  Radio,
  Send,
  Loader2,
  CheckCircle2,
  Flame,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

interface CaseOption {
  id: string;
  victimName: string;
  caseNumber: string;
}

interface ChannelSimulatorProps {
  cases: CaseOption[];
}

export function ChannelSimulator({ cases }: ChannelSimulatorProps) {
  const [activeTab, setActiveTab] = useState<"SMS" | "IVRS" | "HELPLINE">("SMS");
  const [selectedCaseId, setSelectedCaseId] = useState<string>(cases[0]?.id || "");
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<ChannelIngestionResult | null>(null);

  // Form states for SMS
  const [smsPhone, setSmsPhone] = useState("+91 98765 43210");
  const [smsText, setSmsText] = useState(
    "Ghar ke bahar do log ghoom rahe hain aur darr lag raha hai. Kripya kisi ko bhejein."
  );

  // Form states for IVRS
  const [ivrsPhone, setIvrsPhone] = useState("+91 98765 43210");
  const [ivrsDtmf, setIvrsDtmf] = useState("1");
  const [ivrsTranscript, setIvrsTranscript] = useState(
    "Main bohot pareshan hoon, raat ko neend nahi aati aur darr lagta hai."
  );
  const [ivrsDuration, setIvrsDuration] = useState("45");

  // Form states for Helpline
  const [helplineCaller, setHelplineCaller] = useState("+91 98765 43210");
  const [helplineNotes, setHelplineNotes] = useState(
    "Complainant called 14566 helpline reporting acute safety fear after court summons notice was served yesterday."
  );
  const [helplineTier, setHelplineTier] = useState<"NORMAL" | "CONCERN" | "ELEVATED" | "CRITICAL">("CRITICAL");
  const [helplineCallback, setHelplineCallback] = useState(true);

  async function handleSmsSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setLastResult(null);

    const fd = new FormData();
    fd.append("fromPhone", smsPhone);
    fd.append("messageBody", smsText);
    if (selectedCaseId) fd.append("caseId", selectedCaseId);

    try {
      const res = await simulateSMSAction(null, fd);
      setLastResult(res);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleIvrsSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setLastResult(null);

    const fd = new FormData();
    fd.append("callerPhone", ivrsPhone);
    fd.append("dtmfScore", ivrsDtmf);
    fd.append("speechTranscript", ivrsTranscript);
    fd.append("durationSeconds", ivrsDuration);
    if (selectedCaseId) fd.append("caseId", selectedCaseId);

    try {
      const res = await simulateIVRSAction(null, fd);
      setLastResult(res);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleHelplineSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setLastResult(null);

    const fd = new FormData();
    fd.append("callerIdentifier", helplineCaller);
    fd.append("notes", helplineNotes);
    fd.append("reportedDistressTier", helplineTier);
    fd.append("callerWantsCallBack", String(helplineCallback));
    if (selectedCaseId) fd.append("caseId", selectedCaseId);

    try {
      const res = await simulateHelplineAction(null, fd);
      setLastResult(res);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Target Case Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-border bg-card p-4">
        <div>
          <span className="text-sm font-semibold text-foreground">Target Case Context</span>
          <p className="text-xs text-muted-foreground">
            Select the case record that will ingest the simulated channel signal.
          </p>
        </div>
        <select
          value={selectedCaseId}
          onChange={(e) => setSelectedCaseId(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {cases.map((c) => (
            <option key={c.id} value={c.id}>
              {c.caseNumber} — {c.victimName}
            </option>
          ))}
        </select>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          type="button"
          onClick={() => setActiveTab("SMS")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition ${
            activeTab === "SMS"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          SMS Ingestion
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("IVRS")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition ${
            activeTab === "IVRS"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Radio className="h-4 w-4" />
          IVRS Telephony Call
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("HELPLINE")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition ${
            activeTab === "HELPLINE"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <PhoneCall className="h-4 w-4" />
          National Helpline 14566
        </button>
      </div>

      {/* Tab 1: SMS */}
      {activeTab === "SMS" && (
        <form onSubmit={handleSmsSubmit} className="space-y-4 rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              Simulate Inbound SMS Message
            </h3>
            <span className="text-xs text-muted-foreground">Webhook route: /api/channels/sms</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground">Sender Phone Number</label>
              <input
                type="text"
                value={smsPhone}
                onChange={(e) => setSmsPhone(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground">Quick Presets</label>
              <div className="mt-1 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setSmsText("Ghar ke bahar do log ghoom rahe hain aur darr lag raha hai. Kripya kisi ko bhejein.")
                  }
                  className="rounded bg-secondary px-2.5 py-1 text-xs text-secondary-foreground hover:bg-secondary/80"
                >
                  Distress (Hindi)
                </button>
                <button
                  type="button"
                  onClick={() => setSmsText("911")}
                  className="rounded bg-destructive/15 px-2.5 py-1 text-xs font-medium text-destructive hover:bg-destructive/25"
                >
                  Urgent (911)
                </button>
                <button
                  type="button"
                  onClick={() => setSmsText("1")}
                  className="rounded bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300"
                >
                  Safe (1)
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground">Inbound Message Body</label>
            <textarea
              rows={3}
              value={smsText}
              onChange={(e) => setSmsText(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Trigger SMS Webhook
          </button>
        </form>
      )}

      {/* Tab 2: IVRS */}
      {activeTab === "IVRS" && (
        <form onSubmit={handleIvrsSubmit} className="space-y-4 rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Radio className="h-4 w-4 text-primary" />
              Simulate Automated IVRS Phone Call
            </h3>
            <span className="text-xs text-muted-foreground">Webhook route: /api/channels/ivrs</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground">Caller Phone</label>
              <input
                type="text"
                value={ivrsPhone}
                onChange={(e) => setIvrsPhone(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground">DTMF Keypress (1–5)</label>
              <select
                value={ivrsDtmf}
                onChange={(e) => setIvrsDtmf(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="1">1 — Critical Distress / Urgent Help</option>
                <option value="2">2 — High Concern / Unsafe</option>
                <option value="3">3 — Moderate Distress</option>
                <option value="4">4 — Mild Concern</option>
                <option value="5">5 — Doing Well / Safe</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground">Call Duration (seconds)</label>
              <input
                type="number"
                value={ivrsDuration}
                onChange={(e) => setIvrsDuration(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground">
              Transcribed Voicemail Speech (Optional)
            </label>
            <textarea
              rows={3}
              value={ivrsTranscript}
              onChange={(e) => setIvrsTranscript(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Trigger IVRS Ingestion
          </button>
        </form>
      )}

      {/* Tab 3: Helpline */}
      {activeTab === "HELPLINE" && (
        <form onSubmit={handleHelplineSubmit} className="space-y-4 rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <PhoneCall className="h-4 w-4 text-primary" />
              Simulate National Helpline 14566 Intake Referral
            </h3>
            <span className="text-xs text-muted-foreground">Webhook route: /api/channels/helpline</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground">Caller Identifier / Phone</label>
              <input
                type="text"
                value={helplineCaller}
                onChange={(e) => setHelplineCaller(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground">Reported Distress Tier</label>
              <select
                value={helplineTier}
                onChange={(e) =>
                  setHelplineTier(e.target.value as "NORMAL" | "CONCERN" | "ELEVATED" | "CRITICAL")
                }
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="CRITICAL">CRITICAL (Immediate safety risk)</option>
                <option value="ELEVATED">ELEVATED (High distress reported)</option>
                <option value="CONCERN">CONCERN (Moderate needs)</option>
                <option value="NORMAL">NORMAL (Information request)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground">Helpline Operator Intake Notes</label>
            <textarea
              rows={3}
              value={helplineNotes}
              onChange={(e) => setHelplineNotes(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="callback-req"
              checked={helplineCallback}
              onChange={(e) => setHelplineCallback(e.target.checked)}
              className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
            />
            <label htmlFor="callback-req" className="text-xs text-foreground">
              Complainant explicitly requested immediate counselor callback (auto-schedules follow-up)
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Ingest Helpline Referral
          </button>
        </form>
      )}

      {/* Live Result Feedback Card */}
      {lastResult && (
        <div
          className={`rounded-lg border p-5 shadow-sm transition ${
            lastResult.alertTriggered
              ? "border-destructive/40 bg-destructive/10"
              : "border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/30"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {lastResult.alertTriggered ? (
                <ShieldAlert className="h-5 w-5 text-destructive" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              )}
              <h4 className="text-sm font-semibold text-foreground">
                Channel Ingestion Complete: {lastResult.channel}
              </h4>
            </div>

            {lastResult.alertTriggered && (
              <span className="inline-flex items-center gap-1 rounded-full bg-destructive px-2.5 py-0.5 text-xs font-semibold text-destructive-foreground">
                <Flame className="h-3 w-3" />
                {lastResult.alertSeverity} Alert Triggered!
              </span>
            )}
          </div>

          <p className="mt-2 text-xs text-foreground/90">{lastResult.message}</p>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground border-t border-border/40 pt-3">
            <span>
              <strong>Case ID:</strong> {lastResult.caseId}
            </span>
            {lastResult.riskScore !== undefined && (
              <span>
                <strong>Calculated Distress Signal:</strong> {lastResult.riskScore} / 100
              </span>
            )}
            <Link
              href={`/counselor/cases/${lastResult.caseId}`}
              className="inline-flex items-center gap-1 font-medium text-primary hover:underline ml-auto"
            >
              View Case Workspace
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
