
export async function fetchGeminiInsight(promptText, retries = 2) {
  const url = "http://localhost:8080/api/gemini/insight";

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptText }),
      });

      if (!res.ok) {
        throw new Error(`Gemini API failed: ${res.status} ${res.statusText}`);
      }

      const text = await res.text();

      if (!text || text.toLowerCase().includes("error")) {
        throw new Error("Gemini returned invalid or empty response.");
      }

      return text;
    } catch (err) {
      console.error(`❌ Gemini API error on attempt ${attempt + 1}:`, err.message || err);
      if (attempt === retries) {
        throw err;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000)); // wait 1 second before retry
    }
  }
}
