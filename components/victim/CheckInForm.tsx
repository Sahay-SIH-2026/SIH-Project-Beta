"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
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
} from "lucide-react";
import Vapi from "@vapi-ai/web";
import { LiveWaveform } from "@/components/ui/live-waveform";

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

  const vapiRef = useRef<InstanceType<typeof Vapi> | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const baselineTextRef = useRef<string>("");

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (vapiRef.current) {
        try {
          if (typeof vapiRef.current.removeAllListeners === "function") {
            vapiRef.current.removeAllListeners();
          }
          vapiRef.current.stop();
        } catch {
          // ignore cleanup errors
        }
      }
    };
  }, []);

  function startRecording() {
    setStatus(null);
    if (typeof window === "undefined") return;

    // Anchor the current text so partial transcripts can append cleanly without repeating what's already there
    baselineTextRef.current = text.trim();

    try {
      let vapi = vapiRef.current;

      const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
      if (!publicKey) {
        setStatus({ error: "Voice integration is not configured properly." });
        return;
      }

      if (!vapi) {
        // Only instantiate the SDK once per component lifecycle to prevent daily-js leaks
        vapi = new Vapi(publicKey);
        vapiRef.current = vapi;
      } else {
        vapi.stop();
        if (typeof vapi.removeAllListeners === "function") {
          vapi.removeAllListeners();
        }
      }

      vapi.on("call-start", () => {
        setIsRecording(true);
        setStatus({ message: "Your voice is being converted to text…" });
        setRecordingSeconds(0);

        // Mute the assistant locally so the victim only experiences the UI transcription, not the synthetic voice
        vapi.setVolume(0);

        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          setRecordingSeconds((sec) => sec + 1);
        }, 1000);
      });

      vapi.on("call-end", () => {
        setIsRecording(false);
        setStatus({ message: "Voice input stopped." });
        if (timerRef.current) clearInterval(timerRef.current);
      });

      vapi.on("error", (error: any) => {
        console.error("VAPI ERROR:", error);
        stopRecording();
        const errMsg =
          error?.message || error?.error?.message || typeof error === "string"
            ? error
            : JSON.stringify(error);
        setStatus({ error: `Voice API Error: ${errMsg}` });
      });

      vapi.on("message", (message: any) => {
        console.log("VAPI MESSAGE:", message);

        const type = message?.type;

        // Actual transcript messages
        if (type === "transcript" && message.role === "user") {
          const transcriptText =
            message?.transcript ||
            message?.text ||
            message?.transcript?.text ||
            "";

          console.log("VAPI TRANSCRIPT:", transcriptText);
          console.log(
            "VAPI TRANSCRIPT TYPE:",
            message.transcriptType || (message.isFinal ? "final" : "partial"),
          );

          if (transcriptText.trim()) {
            const isFinal =
              message.transcriptType === "final" || message.isFinal === true;

            if (isFinal) {
              setText((prev) => {
                const cleanPrev = prev.replace(/\s*\.\.\.$/, "").trim();
                const newText = cleanPrev
                  ? `${cleanPrev} ${transcriptText.trim()}`
                  : transcriptText.trim();
                baselineTextRef.current = newText;
                return newText;
              });
              setVoiceUsed(true);
            } else {
              // It's a partial/interim transcript
              setText((prev) => {
                const cleanPrev = prev.replace(/\s*\.\.\.$/, "").trim();
                return cleanPrev
                  ? `${cleanPrev} ${transcriptText.trim()}...`
                  : `${transcriptText.trim()}...`;
              });
            }
          }
        }

        // Some Vapi configurations send conversation updates
        if (type === "conversation-update") {
          const messages = message?.messages;

          if (Array.isArray(messages)) {
            const userMessages = messages.filter(
              (m: any) => m?.role === "user",
            );

            const latest = userMessages[userMessages.length - 1];

            if (latest?.content) {
              console.log("VAPI TRANSCRIPT:", latest.content);
              console.log("VAPI TRANSCRIPT TYPE:", "conversation-update-final");

              setText(latest.content);
              setVoiceUsed(true);
            }
          }
        }
      });

      const langCode = selectedLang === "hi-IN" ? "hi" : "en-IN";
      console.log("VAPI LANGUAGE:", langCode);

      const assistantConfig = {
        name: "CheckInListener",
        firstMessage: "",
        clientMessages: [
          "transcript",
          "conversation-update",
          "speech-update",
        ] as any,
        model: {
          provider: "openai" as const,
          model: "gpt-3.5-turbo" as const,
          messages: [
            {
              role: "system" as const,
              content:
                "You are a friendly transcriber assistant. When the user speaks, just reply with 'Okay, I am listening.'",
            },
          ],
        },
        transcriber: {
          provider: "deepgram" as const,
          model: "nova-2" as const,
          language: langCode as any,
        },
      };

      vapi.start(assistantConfig).catch((err: Error) => {
        console.error("Failed to start Vapi:", err);
        setStatus({
          error:
            "Microphone access is required to use voice check-in, or connection failed.",
        });
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
      });

      setStatus({ message: "Connecting to secure voice service..." });
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
      setStatus({ error: "Voice check-in is unavailable right now." });
    }
  }

  const [isFinishing, setIsFinishing] = useState(false);

  function stopRecording() {
    if (vapiRef.current) {
      try {
        // Mute the microphone to stop listening but keep socket alive
        vapiRef.current.setMuted(true);
        setIsFinishing(true);
        setStatus({ message: "Fetching final transcription..." });

        // Give the deepgram transcriber 2.5 seconds to flush the buffer
        // backwards over the WebSocket before we destroy the WebRTC connection.
        setTimeout(() => {
          try {
            vapiRef.current?.stop();
          } catch (e) {}
          setIsFinishing(false);
          setIsRecording(false);
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
        }, 2500);
        return;
      } catch {
        // ignore
      }
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsFinishing(false);
    setIsRecording(false);
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
        error:
          err instanceof Error
            ? err.message
            : "Submission failed. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (status?.success) {
    return (
      <section
        className="rounded-lg border border-emerald-200 bg-card p-8 text-center shadow-sm"
        aria-live="polite"
      >
        <CheckCircle2
          className="mx-auto h-12 w-12 text-emerald-600"
          aria-hidden="true"
        />
        <h2 className="mt-4 text-xl font-semibold text-foreground">
          Check-in recorded
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Thank you for checking in. Your response has been securely recorded
          and your support team can review it.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/victim/check-in/history"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground no-underline hover:bg-primary/90"
          >
            View Check-In History
          </Link>
          <Link
            href="/victim"
            className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2.5 text-sm font-semibold text-foreground no-underline hover:bg-secondary"
          >
            Back to Home
          </Link>
        </div>
      </section>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-border bg-card p-6 shadow-sm"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <label
            htmlFor="check-in-text"
            className="block text-sm font-medium text-foreground"
          >
            How are you feeling today?
          </label>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Write or speak freely. You can share your feelings, any difficulties
            you are facing, or what went well.
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
          <label
            htmlFor="voice-lang-select"
            className="text-[11px] text-muted-foreground"
          >
            Speech Language:
          </label>
          <select
            id="voice-lang-select"
            value={selectedLang}
            onChange={(e) =>
              setSelectedLang(e.target.value as "hi-IN" | "en-IN")
            }
            className="rounded border border-input bg-background px-2 py-0.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            disabled={isRecording}
          >
            <option value="hi-IN">हिन्दी / Hindi (hi-IN)</option>
            <option value="en-IN">English (en-IN)</option>
          </select>
        </div>
      </div>

      {/* Voice Recording Control Bar */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
        <div className="flex items-center gap-2 flex-wrap">
          {isRecording ? (
            <button
              type="button"
              onClick={stopRecording}
              disabled={isFinishing}
              className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold shadow-sm transition ${isFinishing ? "bg-muted text-muted-foreground" : "bg-destructive text-destructive-foreground hover:bg-destructive/90 animate-pulse"}`}
            >
              {isFinishing ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Finishing...
                </>
              ) : (
                <>
                  <MicOff className="h-3.5 w-3.5" />
                  Stop Recording ({recordingSeconds}s)
                </>
              )}
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

          {/* Hardcoded Demo Scenario Buttons */}
          <button
            type="button"
            onClick={() => {
              setText(
                "Someone is threatening me to kill and he is outside the door knocking very hard with weapons.",
              );
              setVoiceUsed(false);
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-[11px] font-semibold text-orange-700 shadow-sm transition hover:bg-orange-100 dark:border-orange-900/50 dark:bg-orange-950/40 dark:text-orange-400"
            disabled={isRecording}
          >
            Threat Scenario
          </button>

          <button
            type="button"
            onClick={() => {
              setText(
                "I am being continuously threatened and harassed, and I am afraid for my safety and do not know what to do.",
              );
              setVoiceUsed(false);
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-[11px] font-semibold text-orange-700 shadow-sm transition hover:bg-orange-100 dark:border-orange-900/50 dark:bg-orange-950/40 dark:text-orange-400"
            disabled={isRecording}
          >
            Harassment Scenario
          </button>
        </div>

        {isRecording && !isFinishing && (
          <div className="flex items-center gap-2 text-xs font-medium text-primary">
            <LiveWaveform
              processing
              height={24}
              className="w-24"
              barColor="#253B80"
              aria-hidden="true"
            />
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 animate-pulse rounded-full bg-destructive" />
              Transcribing…
            </span>
          </div>
        )}
      </div>

      {status?.message && !status?.success && (
        <div
          className="mt-3 rounded-md bg-secondary/60 p-3 text-xs text-muted-foreground"
          role="status"
        >
          {status.message}
        </div>
      )}

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
          Your response is protected and shared only with your assigned support
          worker. Non-clinical support indicator only.
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
