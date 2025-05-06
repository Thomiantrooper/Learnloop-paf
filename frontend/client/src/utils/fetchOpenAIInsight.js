export const fetchOpenAIInsight = async (promptText, retryCount = 0) => {
  const OPENAI_API_KEY = "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";e
  const url = "https://api.openai.com/v1/chat/completions";

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful AI assistant that provides motivational and insightful feedback on learning activities."
          },
          {
            role: "user",
            content: promptText
          }
        ]
      })
    });

    if (res.status === 429) {
      if (retryCount < 2) {
        console.warn("⚠️ Rate limited. Retrying in 3 seconds...");
        await new Promise(resolve => setTimeout(resolve, 3000));
        return fetchOpenAIInsight(promptText, retryCount + 1);
      } else {
        throw new Error("Too many retries due to rate limiting.");
      }
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content || content.trim().length < 5) {
      console.error("⚠️ No valid insight returned:", data);
      return "⚠️ No valid AI insight returned. Please try again.";
    }

    return content;
  } catch (error) {
    console.error("❌ OpenAI fetch failed:", error);
    return "❌ Failed to fetch AI insight.";
  }
};
