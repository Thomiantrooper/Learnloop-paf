export async function fetchGeminiInsight(promptText) {
  try {
    const response = await fetch('http://localhost:8080/api/gemini/insight', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: promptText }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch AI insight");
    }

    const data = await response.text();
    return data;
  } catch (error) {
    console.error(error);
    return "Error fetching insight.";
  }
}
