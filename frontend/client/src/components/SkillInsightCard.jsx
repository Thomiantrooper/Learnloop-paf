import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Editor } from "react-draft-wysiwyg";
import { EditorState, convertToRaw, ContentState } from "draft-js";
import draftToHtml from "draftjs-to-html";
import htmlToDraft from "html-to-draftjs";
import { fetchGeminiInsight } from "../utils/fetchGeminiInsight";
import { downloadPDF } from "../utils/pdfUtils";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

function SkillInsightCard({ update }) {
  const navigate = useNavigate();
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [insight, setInsight] = useState(update.aiInsight || "");
  const [friendEmail, setFriendEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(!!update.aiInsight);
  const [showGenerate, setShowGenerate] = useState(!update.aiInsight);

  const isMountedRef = useRef(true);

  useEffect(() => {
    if (update.userReflection) {
      try {
        const contentBlock = htmlToDraft(update.userReflection);
        const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
        setEditorState(EditorState.createWithContent(contentState));
      } catch (err) {
        console.error("Failed to load saved notes:", err);
      }
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [update]);

  const generateInsight = async () => {
    setLoading(true);
    try {
      const prompt = `The user has completed a learning activity titled "${update.title}" with this description: "${update.description}". Please provide deeper motivational insights beyond this description.`;

      const response = await fetchGeminiInsight(prompt);

      console.log("Gemini Response:", response);

      if (!response || response.trim().length < 5) {
        throw new Error("Gemini returned invalid or empty response.");
      }

      if (isMountedRef.current) {
        setInsight(response);
        setShowGenerate(false);
        await saveToDatabase(response, draftToHtml(convertToRaw(editorState.getCurrentContent())));
        setSaved(true);
      }
    } catch (error) {
      console.error("Gemini Insight Error:", error);
      navigate("/error", {
        state: {
          status: "500",
          message: "Failed to generate AI Insight",
          details: error.message || "Unexpected Gemini failure",
        },
      });
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  };

  const saveToDatabase = async (aiInsight, userReflection) => {
    try {
      await fetch(`http://localhost:8080/api/progress-updates/${update.id}/insight`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aiInsight, userReflection }),
      });
    } catch (error) {
      console.error("Error saving to Mongo:", error);
    }
  };

  const sendEmail = async () => {
    if (!friendEmail.endsWith("@gmail.com")) {
      alert("Only Gmail addresses are allowed.");
      return;
    }

    setSending(true);
    try {
      await fetch(`http://localhost:8080/api/progress-updates/${update.id}/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: friendEmail,
          subject: `Skill Insight - ${update.title}`,
          message: `
            <h2>LearnLoop</h2>
            <p><strong>Topic:</strong> ${update.title}</p>
            <p><strong>Description:</strong> ${update.description}</p>
            <p><strong>Date:</strong> ${new Date(update.date).toLocaleDateString()}</p>
            <p><strong>AI Insight:</strong><br/>${insight}</p>
            <p><strong>User Notes:</strong><br/>${draftToHtml(convertToRaw(editorState.getCurrentContent()))}</p>
            <hr/>
            <footer>© 2025 LearnLoop. All rights reserved.</footer>
          `,
        }),
      });
      alert("✅ Email sent!");
    } catch (error) {
      navigate("/error", {
        state: {
          status: "500",
          message: "Failed to send email",
          details: error.message || "Unexpected email error",
        },
      });
    } finally {
      setSending(false);
    }
  };

  const handleDownload = () => {
    const htmlContent = `
      <h1>LearnLoop</h1>
      <p><strong>Topic:</strong> ${update.title}</p>
      <p><strong>Description:</strong> ${update.description}</p>
      <p><strong>Date:</strong> ${new Date(update.date).toLocaleDateString()}</p>
      <hr/>
      <p><strong>AI Insights:</strong><br/>${insight}</p>
      <p><strong>User Notes:</strong><br/>${draftToHtml(convertToRaw(editorState.getCurrentContent()))}</p>
      <footer><small>© 2025 LearnLoop. All rights reserved.</small></footer>
    `;
    downloadPDF(htmlContent, `Skill_Insight_${update.id}.pdf`);
  };

  const isAllowedType = update.type === "New Skill Learned" || update.type === "Completed Tutorial";
  if (!isAllowedType) return null;

  return (
    <div className="bg-white border rounded-lg p-6 shadow-md space-y-4" id={`printable-${update.id}`}>
      <h2 className="text-xl font-semibold text-purple-700">{update.title}</h2>
      <p className="text-sm text-gray-500">📅 {new Date(update.date).toLocaleDateString()}</p>

      {/* AI Insight Section */}
      <div>
        <label className="block font-medium text-gray-800 mb-1">🧠 AI Insight</label>
        {showGenerate ? (
          <button
            onClick={generateInsight}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
            disabled={loading}
          >
            {loading ? "Generating..." : "Click for AI Insight"}
          </button>
        ) : (
          <div className="prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: insight }} />
        )}
      </div>

      {/* Notes Editor */}
      <div>
        <label className="block font-medium text-gray-800 mb-1">📝 My Reflection</label>
        <Editor
          editorState={editorState}
          onEditorStateChange={setEditorState}
          wrapperClassName="border rounded-md"
          editorClassName="min-h-[200px] px-3 py-2"
        />
      </div>

      {/* Email & PDF */}
      <div className="space-y-2 mt-4">
        <input
          type="email"
          placeholder="Friend's Gmail (optional)"
          className="w-full border px-3 py-2 rounded"
          value={friendEmail}
          onChange={(e) => setFriendEmail(e.target.value)}
        />
        <div className="flex gap-3">
          <button
            onClick={sendEmail}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            disabled={sending}
          >
            {sending ? "Sending..." : "Send Email"}
          </button>
          <button
            onClick={handleDownload}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            📥 Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}

export default SkillInsightCard;
