/**
 * Diagnostic test script for LUMA Multi-Channel Ingestion & STT
 */

import assert from "assert";

// 1. Test STT & Voice Cadence Processing
console.log("▶ Testing Voice & Speech-to-Text Module...");

function detectLanguage(text) {
  const hasDevanagari = /[\u0900-\u097F]/.test(text);
  if (hasDevanagari) return { language: "hi" };
  const hinglishKeywords = ["bohot", "ghabrahat", "darr", "madad", "theek", "kripya"];
  const lower = text.toLowerCase();
  if (hinglishKeywords.some((w) => lower.includes(w))) return { language: "hinglish" };
  return { language: "en" };
}

function processVoiceTranscript(payload) {
  const cleanTranscript = payload.transcript.trim();
  const langDetection = detectLanguage(cleanTranscript);
  const words = cleanTranscript.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const durationSeconds = payload.durationSeconds && payload.durationSeconds > 0
    ? payload.durationSeconds
    : Math.max(5, Math.round(wordCount * 0.5));

  const wpm = durationSeconds > 0 ? Math.round((wordCount / durationSeconds) * 60) : 100;

  let cadenceMarker = "NORMAL";
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

// Test A: Rapid agitated voice in Hindi/Hinglish
const sampleA = processVoiceTranscript({
  transcript: "Mujhe bohot ghabrahat ho rahi hai, kal raat kisi ne darwaza khatkhataya aur dhamki di. Meri bachhi ro rahi hai.",
  durationSeconds: 5,
});
assert.strictEqual(sampleA.detectedLanguage, "hinglish");
assert.strictEqual(sampleA.cadenceMarker, "RAPID_AGITATED");
assert.strictEqual(sampleA.isClinicalDiagnosis, false);
console.log("  ✓ Test A passed: Agitated Hinglish voice cadence correctly extracted.");

// Test B: Slow hesitant voice
const sampleB = processVoiceTranscript({
  transcript: "I don't know what to do anymore.",
  durationSeconds: 15,
});
assert.strictEqual(sampleB.detectedLanguage, "en");
assert.strictEqual(sampleB.cadenceMarker, "SLOW_HESITANT");
assert.strictEqual(sampleB.isClinicalDiagnosis, false);
console.log("  ✓ Test B passed: Slow hesitant voice correctly flagged as experimental non-clinical metadata.");

// 2. Test SMS Keyword Parsing
console.log("\n▶ Testing Inbound SMS Shortcode Logic...");

function parseSmsShortcode(rawText) {
  const upper = (rawText || "").trim().toUpperCase();
  if (upper === "1" || upper === "OK" || upper === "SAFE" || upper === "THEEK") {
    return { type: "SAFE", text: "Main theek hoon. Sab surakshit hai." };
  }
  if (upper === "2" || upper === "HELP" || upper === "MADAD") {
    return { type: "HELP", text: "Mujhe madad ki zaroorat hai. Kripya mujhse sampark karein." };
  }
  if (upper === "911" || upper === "URGENT" || upper === "KHATRA") {
    return { type: "EMERGENCY", text: "EMERGENCY: Turant madad chahiye!" };
  }
  return { type: "FREE_TEXT", text: rawText };
}

assert.strictEqual(parseSmsShortcode("1").type, "SAFE");
assert.strictEqual(parseSmsShortcode("madad").type, "HELP");
assert.strictEqual(parseSmsShortcode("911").type, "EMERGENCY");
assert.strictEqual(parseSmsShortcode("Ghar par koi hai").type, "FREE_TEXT");
console.log("  ✓ SMS quickcode decoding passed (1=SAFE, MADAD=HELP, 911=EMERGENCY, free-text preserved).");

// 3. Test IVRS DTMF Synthesis
console.log("\n▶ Testing IVRS Call Synthesis...");

function synthesizeIvrs(dtmfScore, voiceSnippet, durationSeconds) {
  let narrative = "";
  if (dtmfScore === 1) narrative = "DTMF Keypress 1: Critical distress / Immediate help requested.";
  else if (dtmfScore === 5) narrative = "DTMF Keypress 5: Stable / Feeling safe and calm.";
  else narrative = `DTMF Keypress: ${dtmfScore}`;

  return `[IVRS Call - ${durationSeconds}s] ${narrative} ${voiceSnippet ? `Recorded message: "${voiceSnippet}"` : ""}`.trim();
}

const ivrsCombined = synthesizeIvrs(1, "Help me", 45);
assert(ivrsCombined.includes("DTMF Keypress 1: Critical distress"));
assert(ivrsCombined.includes('Recorded message: "Help me"'));
console.log("  ✓ IVRS telephony combination passed.");

console.log("\n🎉 ALL MULTI-CHANNEL UNIT TESTS PASSED CLEANLY!");
