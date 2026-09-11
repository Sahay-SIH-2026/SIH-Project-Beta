// Removed import

async function main() {
  const text = "someone is threatening to kill me please help";
  
  // Need to mock or transpile TS manually if not handled by Node. Let's just use fetch directly to mimic ollama.ts.
  const prompt = `You are the specific distress parameter extraction component of LUMA.

Analyze ONLY the supplied victim check-in text.
Your job is to identify which qualitative parameter categories apply.

Return ONLY valid JSON in exactly this format:
{
  "immediate_danger": false,
  "signals": [],
  "reason": ""
}

Rules:
- Do not make a clinical diagnosis.
- Base the result only on the supplied text.
- Set immediate_danger=true only when the text clearly indicates immediate or potentially imminent danger.
- "signals" must ONLY contain an array of the following exact strings if they apply. Do not invent others.
  Categories:
  "SAFETY_THREAT" = Violence, ongoing physical harm, direct threats, stalking.
  "SEVERE_DISTRESS" = Panic, extreme emotional deterioration, active trauma responses.
  "HOUSING_INSTABILITY" = Eviction threats, shelter insecurity linked to the case.
  "LEGAL_STRESS" = Court-related panic, severe intimidation around testimony, police friction.
  "POSITIVE_PROTECTIVE" = Feeling safer, improvements, successful counseling, reduced fear.
- Return JSON only. No markdown.

Text:
"someone is threatening to kill me please help"`;

  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "qwen3:8b",
        prompt: prompt,
        stream: false,
      }),
    });

    const data = await response.json();
    console.log("Ollama Data:", data.response);
  } catch (err) {
    console.error(err);
  }
}

main();
