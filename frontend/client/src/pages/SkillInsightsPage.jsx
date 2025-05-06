
import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { fetchGeminiInsight } from "../utils/fetchGeminiInsight";


const SkillInsightsPage = () => {
  const [insights, setInsights] = useState([]);
  const [emailModal, setEmailModal] = useState({ open: false, insightId: null });
  const [emailAddress, setEmailAddress] = useState("");
  const userId = localStorage.getItem("userId");

  const fetchOpenAIInsight = async (promptText) => {
    const OPENAI_API_KEY = "sk-proj-89\_3iHw0EOGCe-7FNXvekeO5p4X-X645lnZljjkgZ1yBNmKq1RbAilXyglNm1E1sCnWR3hNJt6T3BlbkFJ6Jxj2\_JjKJsxX6FEJWumibbhbdFKZP4OVS8REXnXb\_2cQallUhl6RNsqsDynwCgPilrWVNrZcA"; // Replace with your actual key or secure it in .env
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

      const data = await res.json();
      return (
        data?.choices?.[0]?.message?.content || "⚠️ No AI insight returned from OpenAI."
      );
    } catch (error) {
      console.error("OpenAI fetch error:", error);
      return "❌ Failed to fetch AI insight.";
    }
  };

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/progress-updates/user/${userId}`);
        const completedInsights = res.data.filter(update =>
          update.type === "Completed Tutorial" || update.type === "New Skill Learned"
        );

        for (const insight of completedInsights) {
          if (!insight.aiInsight) {
            const prompt = `${insight.title}\n\n${insight.description || ""}`;
            insight.aiInsight = await fetchOpenAIInsight(prompt);
          }
        }

        setInsights([...completedInsights]);
      } catch (error) {
        console.error("Error fetching skill insights:", error);
      }
    };

    fetchInsights();
  }, [userId]);

  const downloadAsPDF = async (insightId) => {
    const card = document.getElementById(`insight-${insightId}`);
    if (!card) return;
    const canvas = await html2canvas(card);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF();
    pdf.addImage(imgData, "PNG", 10, 10, 190, 0);
    pdf.save(`Skill_Insight_${insightId}.pdf`);
  };

  const openEmailModal = (id) => {
    setEmailModal({ open: true, insightId: id });
  };

  const closeEmailModal = () => {
    setEmailModal({ open: false, insightId: null });
    setEmailAddress("");
  };

  const sendEmail = async () => {
    if (!emailAddress || !emailAddress.includes("@gmail.com")) {
      alert("Please enter a valid Gmail address!");
      return;
    }

    try {
      await axios.post(`http://localhost:8080/api/progress-updates/${emailModal.insightId}/email`, {
        to: emailAddress,
        subject: "Skill Insight from LearnLoop",
        message: "Hi, here’s your completed skill insight!"
      });
      alert("✅ Email sent successfully!");
      closeEmailModal();
    } catch (error) {
      console.error("Email failed:", error);
      alert("❌ Failed to send email.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <h1 className="text-3xl font-bold text-indigo-700 mb-6">🎖️ My Skill Insights</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {insights.map((insight) => (
          <div
            id={`insight-${insight.id}`}
            key={insight.id}
            className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition space-y-4"
          >
            <h2 className="text-xl font-semibold text-gray-800">{insight.title}</h2>
            <p className="text-gray-600">{insight.aiInsight || "No AI Insight available."}</p>

            <div className="flex gap-4">
              <button
                onClick={() => downloadAsPDF(insight.id)}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                📥 Download
              </button>

              <button
                onClick={() => openEmailModal(insight.id)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                ✉️ Share via Email
              </button>
            </div>
          </div>
        ))}
      </div>

      {emailModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md space-y-4">
            <h2 className="text-xl font-bold text-gray-800">Share Insight via Email</h2>
            <input
              type="email"
              placeholder="Enter recipient's Gmail"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              className="border w-full p-2 rounded"
            />
            <div className="flex gap-4 justify-end">
              <button
                onClick={sendEmail}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Send
              </button>
              <button
                onClick={closeEmailModal}
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillInsightsPage;
