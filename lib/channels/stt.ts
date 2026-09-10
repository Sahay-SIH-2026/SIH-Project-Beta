import type { VoiceTranscriptionPayload } from "./types";
import { detectLanguage } from "@/lib/ai/multilingual-dictionary";

export interface ProcessedVoiceCheckIn {
  transcript: string;
  detectedLanguage: string;
  wordCount: number;
  durationSeconds: number;
  estimatedSpeechRateWpm: number;
  cadenceMarker: "SLOW_HESITANT" | "NORMAL" | "RAPID_AGITATED";
  /** Explicit non-clinical guardrail flag */
  isClinicalDiagnosis: false;
}

/**
 * Normalizes speech-to-text transcript and derives experimental non-clinical cadence features.
 */
export function processVoiceTranscript(
  payload: VoiceTranscriptionPayload
): ProcessedVoiceCheckIn {
  const cleanTranscript = payload.transcript.trim();
  const langDetection = detectLanguage(cleanTranscript);
  const words = cleanTranscript.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const durationSeconds = payload.durationSeconds && payload.durationSeconds > 0
    ? payload.durationSeconds
    : Math.max(5, Math.round(wordCount * 0.5)); // estimate ~120 wpm if duration missing

  const wpm = durationSeconds > 0 ? Math.round((wordCount / durationSeconds) * 60) : 100;

  let cadenceMarker: "SLOW_HESITANT" | "NORMAL" | "RAPID_AGITATED" = "NORMAL";
  if (wpm < 70) {
    cadenceMarker = "SLOW_HESITANT";
  } else if (wpm > 175) {
    cadenceMarker = "RAPID_AGITATED";
  }

  return {
    transcript: cleanTranscript,
    detectedLanguage: langDetection.language,
    wordCount,
    durationSeconds,
    estimatedSpeechRateWpm: wpm,
    cadenceMarker,
    isClinicalDiagnosis: false,
  };
}

/**
 * Synthetic / demo STT simulator for test suite or demo mode
 */
export function generateMockVoiceTranscript(sampleId?: string): VoiceTranscriptionPayload {
  const samples: Record<string, VoiceTranscriptionPayload> = {
    distressed_hindi: {
      transcript: "Mujhe bohot ghabrahat ho rahi hai, kal raat kisi ne darwaza khatkhataya aur dhamki di. Meri bachhi ro rahi hai.",
      detectedLanguage: "hinglish",
      durationSeconds: 14,
      speechRateCategory: "RAPID_AGITATED",
    },
    stable_hindi: {
      transcript: "Namaste ma'am, aaj sab theek hai. Maine dawai le li aur bachhe school gaye hain. Thoda aaram mila.",
      detectedLanguage: "hinglish",
      durationSeconds: 10,
      speechRateCategory: "NORMAL",
    },
    severe_english: {
      transcript: "I cannot stay in this house anymore. He knows where I am staying and sent people to warn me. Please call me back.",
      detectedLanguage: "en",
      durationSeconds: 12,
      speechRateCategory: "RAPID_AGITATED",
    },
  };

  return samples[sampleId || "distressed_hindi"] || samples.distressed_hindi;
}
