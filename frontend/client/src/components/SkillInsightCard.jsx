import React, { useEffect, useState } from "react";
import { Editor } from "react-draft-wysiwyg";
import { EditorState, convertToRaw } from "draft-js";
import draftToHtml from "draftjs-to-html";
import { fetchGeminiInsight } from "../utils/fetchGeminiInsight";
import { downloadPDF } from "../utils/pdfUtils";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

function SkillInsightCard({ update }) {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [insight, setInsight] = useState(update.aiInsight || "");
  const [friendEmail, setFriendEmail] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!update.aiInsight) {
      fetchGeminiInsight(update.id).then(setInsight);
    } else {
      setInsight(update.aiInsight);
    }
  }, [update]);

  useEffect(() => {
    if (!update.aiInsight && update.description) {
      fetchGeminiInsight(update.description).then(setInsight);
    } else {
      setInsight(update.aiInsight || "No AI insight generated.");
    }
  }, [update]);

  
  const sendEmail = async () => {
    if (friendEmail && !friendEmail.endsWith("@gmail.com")) {
      alert("Only Gmail addresses are allowed!");
      return;
    }

    setSending(true);

    const htmlReflection = draftToHtml(convertToRaw(editorState.getCurrentContent()));

    await fetch(`http://localhost:8080/api/progress-updates/${update.id}/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: friendEmail,
        subject: `Skill Insight - ${update.title}`,
        message: `AI Insight:\n${insight}\n\nReflection:\n${htmlReflection}`
      }),
    });

    setSending(false);
    alert("✅ Email Sent!");
  };

  

  return (
    <div className="bg-white border rounded-lg p-6 shadow-md space-y-4" id={`printable-${update.id}`}>
      <h2 className="text-xl font-semibold text-purple-700">{update.title}</h2>
      <p className="text-sm text-gray-500">📅 {new Date(update.date).toLocaleDateString()}</p>

      {/* AI Insight */}
      <div className="mt-3">
        <label className="block font-medium text-gray-800 mb-1">🧠 AI Insight</label>
        <div
  className="prose prose-sm max-w-none text-gray-700"
  dangerouslySetInnerHTML={{ __html: insight }}
/>

      </div>

      {/* Reflection Editor */}
      <div className="mt-3">
        <label className="block font-medium text-gray-800 mb-1">📝 My Reflection</label>
        <Editor
          editorState={editorState}
          onEditorStateChange={setEditorState}
          wrapperClassName="border rounded-md"
          editorClassName="min-h-[200px] px-3 py-2"
          toolbar={{
            options: ['inline', 'list', 'textAlign', 'history'],
            inline: { inDropdown: false, options: ['bold', 'italic', 'underline'] },
            list: { inDropdown: false, options: ['unordered', 'ordered'] },
            textAlign: { inDropdown: false },
            history: { inDropdown: false }
          }}
        />
      </div>

      {/* Email + Download */}
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
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={sending}
          >
            {sending ? "Sending..." : "Send Email"}
          </button>

          <button
            onClick={() => {
              const htmlContent = draftToHtml(convertToRaw(editorState.getCurrentContent()));
              const printable = `
                <div>
                  <h2>${update.title}</h2>
                  <p><strong>Date:</strong> ${new Date(update.date).toLocaleDateString()}</p>
                  <p><strong>AI Insight:</strong><br>${insight}</p>
                  <p><strong>Reflection:</strong><br>${htmlContent}</p>
                </div>
              `;
              downloadPDF(printable, `Skill_Insight_${update.id}`);
            }}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            📥 Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}

export default SkillInsightCard;
