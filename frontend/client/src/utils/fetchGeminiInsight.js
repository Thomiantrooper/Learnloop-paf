export const fetchGeminiInsight = async (prompt) => {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyCgbIL3dMT4Yj1uu0w7MyfPbuxjgh1Dy4w`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API Error:", data);
      throw new Error(data?.error?.message || "Gemini API failed");
    }

    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch (err) {
    console.error("❌ Error in fetchGeminiInsight:", err);
    throw err;
  }
};
