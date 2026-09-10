export type IngestionChannelType =
  | "VOICE_STT"
  | "IVRS"
  | "SMS"
  | "HELPLINE_14566"
  | "IN_APP";

export interface VoiceTranscriptionPayload {
  caseId?: string;
  victimId?: string;
  transcript: string;
  detectedLanguage?: string;
  durationSeconds?: number;
  speechRateCategory?: "SLOW_HESITANT" | "NORMAL" | "RAPID_AGITATED";
}

export interface SMSPayload {
  fromPhone: string;
  toPhone?: string;
  messageBody: string;
  timestamp?: string;
  caseId?: string;
}

export interface IVRSPayload {
  callerPhone: string;
  callSid?: string;
  dtmfScore?: number; // 1-5 rating (e.g. 1=Critical Distress, 5=Doing Well)
  speechTranscript?: string;
  durationSeconds?: number;
  completedAt?: string;
  caseId?: string;
}

export interface HelplineCallPayload {
  callerIdentifier: string; // Phone or Case identifier
  operatorId?: string;
  notes: string;
  reportedDistressTier: "NORMAL" | "CONCERN" | "ELEVATED" | "CRITICAL";
  callerWantsCallBack: boolean;
  receivedAt?: string;
  caseId?: string;
}

export interface ChannelIngestionResult {
  success: boolean;
  channel: IngestionChannelType;
  caseId: string;
  victimId?: string;
  checkInId?: string;
  interactionId?: string;
  riskScore?: number;
  alertTriggered: boolean;
  alertSeverity?: "LOW" | "MEDIUM" | "HIGH";
  message: string;
}

export interface ChannelMetrics {
  totalInboundToday: number;
  byChannel: {
    inApp: number;
    voice: number;
    sms: number;
    ivrs: number;
    helpline: number;
  };
  highRiskAlertsGenerated: number;
  avgResolutionTimeHours: number;
}
