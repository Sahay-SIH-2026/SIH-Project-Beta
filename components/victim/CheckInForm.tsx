"use client";

import { useState, useRef, useEffect } from "react";
import { submitCheckInAction } from "@/app/actions/check-ins";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
  Globe,
  Mic,
  MicOff,
  Volume2,
  Sparkles,
} from "lucide-react";
import { generateMockVoiceTranscript } from "@/lib/channels/stt";

// TypeScript declaration for Web Speech API
interface SpeechRecognitionEventLike {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

export function CheckInForm() {
  const [text, setText] = useState("");
  const [voiceUsed, setVoiceUsed] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedLang, setSelectedLang] = useState<"hi-IN" | "en-IN">("hi-IN");
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{
    error?: string;
    success?: boolean;
    message?: string;
  } | null>(null);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore cleanup errors
        }
      }
    };
  }, []);

  function startRecording() {
    setStatus(null);
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionLike }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Fallback if browser doesn't have native STT: simulate voice input
      loadSampleVoiceCheckIn("distressed_hindi");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = selectedLang;

      recognition.onresult = (event: SpeechRecognitionEventLike) => {
        let currentTranscript = "";
        for (let i = 0; i < Object.keys(event.results).length; i++) {
          const item = event.results[i];
          if (item && item[0]) {
            currentTranscript += item[0].transcript + " ";
          }
        }
        if (currentTranscript.trim()) {
          setText((prev) => {
            const base = prev.trim();
            return base ? `${base} ${currentTranscript.trim()}` : currentTranscript.trim();
          });
          setVoiceUsed(true);
        }
      };

      recognition.onerror = (err) => {
        console.warn("Speech recognition error:", err.error);
        stopRecording();
      };

      recognition.onend = () => {
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((sec) => sec + 1);
      }, 1000);
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
      // Fallback
      loadSampleVoiceCheckIn("distressed_hindi");
    }
  }

  function stopRecording() {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
  }

  function loadSampleVoiceCheckIn(sampleId: "distressed_hindi" | "stable_hindi" | "severe_english") {
    const sample = generateMockVoiceTranscript(sampleId);
    setText((prev) => (prev ? `${prev}\n\n${sample.transcript}` : sample.transcript));
    setVoiceUsed(true);
    setStatus({
      message: `Simulated ${(sample.detectedLanguage || "hi").toUpperCase()} voice check-in transcribed into text.`,
      success: true,
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!text.trim()) return;

    if (isRecording) {
      stopRecording();
    }

    setIsSubmitting(true);
    setStatus(null);

    const formData = new FormData();
    formData.append("responseText", text);
    formData.append("voiceInputUsed", String(voiceUsed));

    try {
      const result = await submitCheckInAction(undefined, formData);
      setStatus(result);
      if (result.success) {
        setText("");
        setVoiceUsed(false);
      }
    } catch (err: unknown) {
      setStatus({
        error: err instanceof Error ? err.message : "Submission failed. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <label
            htmlFor="check-in-text"
            className="block text-sm font-medium text-foreground"
          >
            How are you feeling today?
          </label>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Write or speak freely. You can share your feelings, any difficulties you are facing, or what went well.
          </p>
        </div>

        {/* Voice / Text Mode Badges */}
        {voiceUsed && (
          <div className="inline-flex items-center gap-1.5 self-start rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
            <Volume2 className="h-3.5 w-3.5" />
            Voice Input Recorded
          </div>
        )}
      </div>

      {/* Multilingual Reassurance Banner */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-md bg-secondary/50 px-3.5 py-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5 font-medium text-foreground">
          <Globe className="h-3.5 w-3.5 text-primary" />
          <span>Multilingual Voice & Text:</span>
          <span className="font-normal text-muted-foreground">
            Supports English, हिन्दी (Devanagari), or Hinglish.
          </span>
        </div>

        {/* Language selector for voice recognition */}
        <div className="flex items-center gap-2">
          <label htmlFor="voice-lang-select" className="text-[11px] text-muted-foreground">Speech Language:</label>
          <select
            id="voice-lang-select"
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value as "hi-IN" | "en-IN")}
            className="rounded border border-input bg-background px-2 py-0.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            disabled={isRecording}
          >
            <option value="hi-IN">हिन्दी / Hindi (hi-IN)</option>
            <option value="en-IN">English (en-IN)</option>
          </select>
        </div>
      </div>

      {/* Voice Recording Control Bar */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
        <div className="flex items-center gap-3">
          {isRecording ? (
            <button
              type="button"
              onClick={stopRecording}
              className="inline-flex items-center gap-2 rounded-full bg-destructive px-3.5 py-1.5 text-xs font-semibold text-destructive-foreground shadow-sm transition hover:bg-destructive/90 animate-pulse"
            >
              <MicOff className="h-3.5 w-3.5" />
              Stop Recording ({recordingSeconds}s)
            </button>
          ) : (
            <button
              type="button"
              onClick={startRecording}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
              title="Record your voice with real-time speech recognition"
            >
              <Mic className="h-3.5 w-3.5" />
              Speak Check-In (Voice to Text)
            </button>
          )}

          {isRecording && (
            <span className="flex items-center gap-1.5 text-xs text-destructive font-medium animate-pulse">
              <span className="h-2 w-2 rounded-full bg-destructive" />
              Listening to your voice… Speak naturally
            </span>
          )}
        </div>

        {/* Quick Demo Voice Fillers (for testing when microphone is inaccessible) */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="text-[11px]">Demo voice audio:</span>
          <button
            type="button"
            onClick={() => loadSampleVoiceCheckIn("distressed_hindi")}
            className="inline-flex items-center gap-1 rounded bg-secondary px-2 py-1 text-[11px] font-medium text-secondary-foreground hover:bg-secondary/80"
          >
            <Sparkles className="h-3 w-3 text-amber-500" />
            Distressed (Hindi)
          </button>
          <button
            type="button"
            onClick={() => loadSampleVoiceCheckIn("stable_hindi")}
            className="inline-flex items-center gap-1 rounded bg-secondary px-2 py-1 text-[11px] font-medium text-secondary-foreground hover:bg-secondary/80"
          >
            <Sparkles className="h-3 w-3 text-emerald-500" />
            Stable (Hindi)
          </button>
        </div>
      </div>

      <textarea
        id="check-in-text"
        name="check-in-text"
        rows={5}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="You can write anything here, or click 'Speak Check-In' to talk in complete privacy…"
        className="mt-3 w-full resize-none rounded-md border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        aria-describedby="check-in-note"
        disabled={isSubmitting}
        required
      />

      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <span id="check-in-note">
          Your response is protected and shared only with your assigned support worker. Non-clinical support indicator only.
        </span>
        <span>{text.length} characters</span>
      </div>

      {status?.error && (
        <div className="mt-4 flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{status.error}</span>
        </div>
      )}

      {status?.success && (
        <div className="mt-4 flex items-start gap-2 rounded-md bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
          <span>{status.message}</span>
        </div>
      )}

      <div className="mt-5 flex items-center justify-between">
        <button
          type="submit"
          disabled={isSubmitting || !text.trim()}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting…
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Submit Check-In
            </>
          )}
        </button>

        {voiceUsed && (
          <span className="text-xs text-muted-foreground">
            Transcribed from voice audio
          </span>
        )}
      </div>
    </form>
  );
}
