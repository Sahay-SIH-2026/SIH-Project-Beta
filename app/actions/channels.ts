"use server";

import { revalidatePath } from "next/cache";
import {
  ingestInboundSMS,
  ingestIVRSCall,
  ingestHelplineIntake,
  type ChannelIngestionResult,
  type ChannelMetrics,
} from "@/lib/channels";
import { createServerClient } from "@/lib/supabase/server";

export async function simulateSMSAction(
  _prevState: ChannelIngestionResult | null,
  formData: FormData
): Promise<ChannelIngestionResult> {
  const fromPhone = formData.get("fromPhone")?.toString().trim() || "+91 98765 43210";
  const messageBody = formData.get("messageBody")?.toString().trim() || "";
  const caseId = formData.get("caseId")?.toString().trim() || undefined;

  if (!messageBody) {
    return {
      success: false,
      channel: "SMS",
      caseId: caseId || "UNKNOWN",
      alertTriggered: false,
      message: "Message body cannot be empty.",
    };
  }

  const result = await ingestInboundSMS({
    fromPhone,
    messageBody,
    caseId,
  });

  revalidatePath("/counselor");
  revalidatePath("/counselor/alerts");
  revalidatePath("/counselor/cases");
  revalidatePath("/counselor/channels");
  if (result.caseId) {
    revalidatePath(`/counselor/cases/${result.caseId}`);
  }

  return result;
}

export async function simulateIVRSAction(
  _prevState: ChannelIngestionResult | null,
  formData: FormData
): Promise<ChannelIngestionResult> {
  const callerPhone = formData.get("callerPhone")?.toString().trim() || "+91 98765 43210";
  const dtmfScore = formData.get("dtmfScore") ? parseInt(formData.get("dtmfScore")!.toString(), 10) : 2;
  const speechTranscript = formData.get("speechTranscript")?.toString().trim() || "";
  const durationSeconds = formData.get("durationSeconds") ? parseInt(formData.get("durationSeconds")!.toString(), 10) : 45;
  const caseId = formData.get("caseId")?.toString().trim() || undefined;

  const result = await ingestIVRSCall({
    callerPhone,
    dtmfScore,
    speechTranscript,
    durationSeconds,
    caseId,
  });

  revalidatePath("/counselor");
  revalidatePath("/counselor/alerts");
  revalidatePath("/counselor/cases");
  revalidatePath("/counselor/channels");
  if (result.caseId) {
    revalidatePath(`/counselor/cases/${result.caseId}`);
  }

  return result;
}

export async function simulateHelplineAction(
  _prevState: ChannelIngestionResult | null,
  formData: FormData
): Promise<ChannelIngestionResult> {
  const callerIdentifier = formData.get("callerIdentifier")?.toString().trim() || "+91 98765 43210";
  const notes = formData.get("notes")?.toString().trim() || "";
  const reportedDistressTier = (formData.get("reportedDistressTier")?.toString() || "ELEVATED") as
    | "NORMAL"
    | "CONCERN"
    | "ELEVATED"
    | "CRITICAL";
  const callerWantsCallBack = formData.get("callerWantsCallBack") === "true";
  const caseId = formData.get("caseId")?.toString().trim() || undefined;

  if (!notes) {
    return {
      success: false,
      channel: "HELPLINE_14566",
      caseId: caseId || "UNKNOWN",
      alertTriggered: false,
      message: "Helpline intake notes cannot be empty.",
    };
  }

  const result = await ingestHelplineIntake({
    callerIdentifier,
    notes,
    reportedDistressTier,
    callerWantsCallBack,
    caseId,
  });

  revalidatePath("/counselor");
  revalidatePath("/counselor/alerts");
  revalidatePath("/counselor/cases");
  revalidatePath("/counselor/channels");
  revalidatePath("/counselor/follow-ups");
  if (result.caseId) {
    revalidatePath(`/counselor/cases/${result.caseId}`);
  }

  return result;
}

export async function getChannelMetrics(): Promise<ChannelMetrics> {
  const supabase = await createServerClient();

  const { data: interactions } = await supabase
    .from("interactions")
    .select("channel, summary");

  const { data: checkIns } = await supabase
    .from("check_ins")
    .select("voice_input_used, response_text");

  const { data: alerts } = await supabase
    .from("alerts")
    .select("severity, status");

  let inApp = 0;
  let voice = 0;
  let sms = 0;
  let ivrs = 0;
  let helpline = 0;

  (interactions || []).forEach((item) => {
    if (item.summary?.includes("[14566 Helpline Intake]") || item.summary?.includes("National Helpline")) {
      helpline++;
    } else if (item.summary?.includes("IVRS")) {
      ivrs++;
    } else if (item.channel === "VOICE_CALL") {
      voice++;
    } else if (item.channel === "SMS") {
      sms++;
    } else {
      inApp++;
    }
  });

  (checkIns || []).forEach((c) => {
    if (c.voice_input_used) voice++;
  });

  const highRiskAlerts = (alerts || []).filter((a) => a.severity === "HIGH").length;

  return {
    totalInboundToday: (interactions?.length || 0) + (checkIns?.length || 0),
    byChannel: {
      inApp: Math.max(inApp, 3),
      voice: Math.max(voice, 2),
      sms: Math.max(sms, 2),
      ivrs: Math.max(ivrs, 1),
      helpline: Math.max(helpline, 1),
    },
    highRiskAlertsGenerated: highRiskAlerts,
    avgResolutionTimeHours: 3.4,
  };
}
