"use client";

import { useState, useRef, useEffect } from "react";
import { logInteractionAction } from "@/app/actions/interactions";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
  Mic,
  MicOff,
} from "lucide-react";
import Vapi from "@vapi-ai/web";

interface RecordSessionStatementProps {
  caseId: string;
}

export function RecordSessionStatement({ caseId }: RecordSessionStatementProps) {
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
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
        } catch {}
      }
    };
  }, []);

  function startRecording() {
    setStatus(null);
    if (typeof window === "undefined") return;

    baselineTextRef.current = text.trim();

    try {
      let vapi = vapiRef.current;
      const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
      if (!publicKey) {
        setStatus({ error: "Voice integration is not configured properly." });
        return;
      }

      if (!vapi) {
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
        setStatus({ message: "Transcribing session..." });
        setRecordingSeconds(0);
        vapi?.setVolume(0);

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
        setStatus({ error: "Voice API Error" });
      });

      vapi.on("message", (message: any) => {
        if (message?.type === "transcript" && message.role === "user") {
          const transcriptText = message?.transcript || message?.text || message?.transcript?.text || "";

          if (transcriptText.trim()) {
            const isFinal = message.transcriptType === "final" || message.isFinal === true;
            if (isFinal) {
              setText((prev) => {
                const cleanPrev = prev.replace(/\s*\.\.\.$/, "").trim();
                return cleanPrev ? `${cleanPrev} ${transcriptText.trim()}` : transcriptText.trim();
              });
            } else {
              setText((prev) => {
                const cleanPrev = prev.replace(/\s*\.\.\.$/, "").trim();
                return cleanPrev ? `${cleanPrev} ${transcriptText.trim()}...` : `${transcriptText.trim()}...`;
              });
            }
          }
        }
      });

      const assistantConfig = {
        name: "SessionListener",
        firstMessage: "",
        clientMessages: ["transcript", "conversation-update", "speech-update"] as any,
        model: {
          provider: "openai" as const,
          model: "gpt-3.5-turbo" as const,
          messages: [
            {
              role: "system" as const,
              content: "You are a transcriber. Listen only.",
            },
          ],
        },
        transcriber: {
          provider: "deepgram" as const,
          model: "nova-2" as const,
          language: "en-IN" as any,
        },
      };

      vapi.start(assistantConfig).catch((err: Error) => {
        console.error(err);
        setStatus({ error: "Microphone access is required." });
        setIsRecording(false);
      });

      setStatus({ message: "Connecting to voice service..." });
    } catch (err) {
      console.error(err);
      setStatus({ error: "Voice unavailable." });
    }
  }

  function stopRecording() {
    if (vapiRef.current) {
      try {
        vapiRef.current.setMuted(true);
        setIsFinishing(true);
        setStatus({ message: "Fetching final transcription..." });
        setTimeout(() => {
          try { vapiRef.current?.stop(); } catch (e) {}
          setIsFinishing(false);
          setIsRecording(false);
          if (timerRef.current) clearInterval(timerRef.current);
        }, 2000);
        return;
      } catch {}
    }
    setIsFinishing(false);
    setIsRecording(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!text.trim()) return;
    if (isRecording) stopRecording();

    setIsSubmitting(true);
    setStatus(null);

    const res = await logInteractionAction(caseId, "IN_PERSON", text);
    
    setIsSubmitting(false);
    if (res.error) {
      setStatus({ error: res.error });
    } else {
      setStatus({ success: true, message: res.message });
      setText("");
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-6 shadow-sm mb-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Mic className="h-5 w-5 text-primary" /> Session Statement
        </h2>
        <p className="text-sm text-muted-foreground">
          Record or manually transcribe victim communication. Distress signals will be securely extracted.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {status && (
          <div
            className={`flex items-center gap-2 rounded-md p-3 text-sm ${
              status.error
                ? "bg-destructive/10 text-destructive"
                : status.success
                ? "bg-emerald-50 text-emerald-700"
                : "bg-blue-50 text-blue-700"
            }`}
          >
            {status.error ? <AlertCircle className="h-4 w-4 shrink-0" /> : <CheckCircle2 className="h-4 w-4 shrink-0" />}
            <span className="font-medium">{status.error || status.message}</span>
          </div>
        )}

        <div className="flex gap-2 mb-2">
          {!isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              disabled={isFinishing || isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
            >
              <Mic className="h-4 w-4" /> Start Voice Recording
            </button>
          ) : (
            <button
              type="button"
              onClick={stopRecording}
              disabled={isFinishing}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50 animate-pulse"
            >
              <MicOff className="h-4 w-4" /> Stop Recording ({Math.floor(recordingSeconds / 60)}:{(recordingSeconds % 60).toString().padStart(2, "0")})
            </button>
          )}
        </div>

        <textarea
          name="statementText"
          rows={6}
          disabled={isSubmitting || isFinishing}
          className="block w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Speak to transcribe automatically or type the statement here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <button
          type="submit"
          disabled={isSubmitting || isFinishing || text.trim().length === 0}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" /> Saving Session & Analyzing...
            </>
          ) : (
            <>
              <Send className="h-5 w-5" /> Save Session Statement
            </>
          )}
        </button>
      </form>
    </div>
  );
}
