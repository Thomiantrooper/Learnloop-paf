import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Editor } from "react-draft-wysiwyg";
import { EditorState, convertToRaw, ContentState } from "draft-js";
import draftToHtml from "draftjs-to-html";
import htmlToDraft from "html-to-draftjs";
import { fetchGeminiInsight } from "../utils/fetchGeminiInsight";
import { downloadPDF } from "../utils/pdfUtils";
import { marked } from "marked";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

function SkillInsightCard({ update, onInsightGenerated }) {
  const navigate = useNavigate();
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [insight, setInsight] = useState(update.aiInsight || "");
  const [friendEmail, setFriendEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState(null);
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

  useEffect(() => {
    setInsight(update.aiInsight || "");
  }, [update.aiInsight]);

  const generateInsight = async () => {
    const title = update.title?.trim();
    const description = update.description?.trim();

    if (!title || !description) {
      setError("Title and description are required to generate insights");
      setTimeout(() => setError(null), 3000);
      return;
    }

    setLoading(true);
    setError(null);
    const prompt = `The user completed/gained a skill on a learning activity titled "${title}" with this description: "${description}". Provide motivational and deeper insights beyond the description, and limit your response to a maximum of 500 words.`;

    try {
      const response = await fetchGeminiInsight(prompt);

      if (!response || response.trim().length < 10) {
        setInsight("No meaningful AI insight could be generated.");
        return;
      }

      const htmlInsight = marked.parse(response);
      setInsight(htmlInsight);

      const reflectionHTML = draftToHtml(convertToRaw(editorState.getCurrentContent()));
      await saveToDatabase(htmlInsight, reflectionHTML);

      if (typeof onInsightGenerated === "function") {
        onInsightGenerated(htmlInsight);
      }
    } catch (error) {
      console.error("Gemini fetch error:", error);
      setError("Failed to generate AI Insight. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const saveToDatabase = async (aiInsight, userReflection) => {
    try {
      const response = await fetch(`http://localhost:8080/api/progress-updates/${update.id}/insight`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aiInsight, userReflection }),
      });

      if (!response.ok) throw new Error("Failed to save insight");
      
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      return await response.json();
    } catch (err) {
      console.error("Error saving insight:", err);
      setError("Failed to save. Please try again.");
      throw err;
    }
  };

  const sendEmail = async () => {
    if (!friendEmail) {
      setError("Please enter an email address");
      return;
    }
    
    if (!friendEmail.endsWith("@gmail.com")) {
      setError("Only Gmail addresses are allowed");
      return;
    }

    setSending(true);
    setError(null);
    try {
      await fetch(`http://localhost:8080/api/progress-updates/${update.id}/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: friendEmail,
          subject: `Skill Insight - ${update.title}`,
          message: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
              <div style="background: linear-gradient(135deg, #6B46C1 0%, #3182CE 100%); padding: 20px; color: white; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="margin: 0; font-size: 24px;">LearnLoop</h1>
                <p style="margin: 5px 0 0; font-size: 14px;">Skill Insight Report</p>
              </div>
              
              <div style="padding: 20px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
                <h2 style="color: #6B46C1; margin-top: 0;">${update.title}</h2>
                <p><strong>Description:</strong> ${update.description}</p>
                <p><strong>Date:</strong> ${new Date(update.date).toLocaleDateString()}</p>
                
                <div style="margin-top: 20px; padding: 15px; background-color: #f8fafc; border-left: 4px solid #6B46C1;">
                  <h3 style="margin-top: 0; color: #4a5568;">AI Insight</h3>
                  ${insight}
                </div>
                
                <div style="margin-top: 20px; padding: 15px; background-color: #f8fafc; border-left: 4px solid #3182CE;">
                  <h3 style="margin-top: 0; color: #4a5568;">My Reflection</h3>
                  ${draftToHtml(convertToRaw(editorState.getCurrentContent()))}
                </div>
                
                <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #718096;">
                  <p>© 2025 LearnLoop. All rights reserved.</p>
                </div>
              </div>
            </div>
          `,
        }),
      });
      setEmailSent(true);
      setFriendEmail("");
      setTimeout(() => setEmailSent(false), 3000);
    } catch (error) {
      setError("Failed to send email. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleDownload = () => {
    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, sans-serif; padding: 30px; color: #333; line-height: 1.6; max-width: 800px;">
        <div style="border-bottom: 2px solid #6B46C1; padding-bottom: 10px; margin-bottom: 20px;">
          <h1 style="margin: 0; color: #6B46C1; display: flex; align-items: center; gap: 10px;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L3 7L12 12L21 7L12 2Z" fill="#6B46C1"/>
              <path d="M3 17L12 22L21 17" stroke="#6B46C1" stroke-width="2" stroke-linecap="round"/>
              <path d="M3 12L12 17L21 12" stroke="#6B46C1" stroke-width="2" stroke-linecap="round"/>
            </svg>
            LearnLoop
          </h1>
          <p style="font-size: 14px; color: #666;">Skill Insight Report</p>
        </div>
  
        <div style="margin-bottom: 20px;">
          <p><strong style="color: #4a5568;">📌 Topic:</strong> ${update.title}</p>
          <p><strong style="color: #4a5568;">📝 Description:</strong> ${update.description}</p>
          <p><strong style="color: #4a5568;">📅 Date:</strong> ${new Date(update.date).toLocaleDateString()}</p>
        </div>
  
        <div style="margin-top: 30px;">
          <h2 style="color: #6B46C1; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; display: flex; align-items: center; gap: 8px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#6B46C1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13" stroke="#6B46C1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 17H12.01" stroke="#6B46C1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            AI Insight
          </h2>
          <div style="padding: 15px; background-color: #f8fafc; border-radius: 6px; border-left: 4px solid #6B46C1;">
            ${insight}
          </div>
        </div>
  
        <div style="margin-top: 30px;">
          <h2 style="color: #3182CE; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; display: flex; align-items: center; gap: 8px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 19H19M12 12H19M12 5H19M5 16V8L7.5 10.5" stroke="#3182CE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M5 5H6C6.55228 5 7 5.44772 7 6V18C7 18.5523 6.55228 19 6 19H5" stroke="#3182CE" stroke-width="2"/>
            </svg>
            My Reflection
          </h2>
          <div style="padding: 15px; background-color: #f8fafc; border-radius: 6px; border-left: 4px solid #3182CE;">
            ${draftToHtml(convertToRaw(editorState.getCurrentContent()))}
          </div>
        </div>
  
        <footer style="margin-top: 40px; text-align: center; font-size: 12px; color: #718096; border-top: 1px solid #e2e8f0; padding-top: 10px;">
          © 2025 LearnLoop · All rights reserved.
        </footer>
      </div>
    `;
  
    downloadPDF(htmlContent, `LearnLoop_Insight_${update.title.replace(/\s+/g, '_')}.pdf`);
  };

  const clearNotes = async () => {
    const emptyState = EditorState.createEmpty();
    setEditorState(emptyState);
    try {
      await saveToDatabase(insight, "");
    } catch (error) {
      console.error(error);
      setError("Failed to clear notes");
    }
  };

  if (update.type !== "New Skill Learned" && update.type !== "Completed Tutorial") return null;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 transition-all hover:shadow-xl" id={`printable-${update.id}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">{update.title}</h2>
            <p className="text-sm opacity-90 mt-1">
              {update.type} • {new Date(update.date).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          {/* <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium">
            {update.type === "New Skill Learned" ? "🎯 Skill" : "✅ Completed"}
          </span> */}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Messages */}
        {saved && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">Changes saved successfully</p>
              </div>
            </div>
          </div>
        )}

        {emailSent && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">Email sent successfully</p>
              </div>
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</h3>
          <p className="text-gray-700">{update.description}</p>
        </div>

        {/* AI Insight Section */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              AI Insight
            </h3>
            {!update.aiInsight && !loading && (
              <button
                onClick={generateInsight}
                className="text-sm bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-4 py-1.5 rounded-full flex items-center gap-1 transition-all shadow-sm hover:shadow-md"
                disabled={loading}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Enhance with AI
              </button>
            )}
          </div>
          
          {loading && !insight ? (
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          ) : insight ? (
            <div className="prose prose-sm max-w-none p-4 bg-gray-50 rounded-lg border border-gray-200" dangerouslySetInnerHTML={{ __html: insight }} />
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200 border-dashed">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No AI Insight Yet</h3>
              <p className="mt-1 text-sm text-gray-500">Click the button above to generate insights with AI.</p>
            </div>
          )}
        </div>

        {/* Notes Editor */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              My Reflection
            </h3>
            <div className="flex gap-2">
              <button
                onClick={clearNotes}
                className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1 transition-colors"
                title="Clear notes"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear
              </button>
            </div>
          </div>
          
          <div className="border rounded-lg overflow-hidden shadow-sm">
            <Editor
              editorState={editorState}
              onEditorStateChange={setEditorState}
              toolbarClassName="border-b border-gray-200 !rounded-t-lg !mb-0"
              wrapperClassName="!border-0"
              editorClassName="min-h-[200px] px-4 py-3"
              toolbar={{
                options: ['inline', 'blockType', 'list', 'textAlign', 'link'],
                inline: { options: ['bold', 'italic', 'underline'] },
                blockType: { options: ['Normal', 'H2', 'H3', 'Blockquote'] },
              }}
            />
          </div>
          
          <div className="flex justify-end mt-3">
            <button
              onClick={async () => {
                const reflectionHTML = draftToHtml(convertToRaw(editorState.getCurrentContent()));
                try {
                  await saveToDatabase(insight, reflectionHTML);
                } catch (error) {
                  console.error(error);
                  setError("Failed to save notes");
                }
              }}
              className="text-sm bg-gray-800 hover:bg-gray-900 text-white px-4 py-1.5 rounded-full flex items-center gap-1 transition-all shadow-sm hover:shadow-md"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Save Notes
            </button>
          </div>
        </div>

        {/* Sharing Options */}
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share Your Insight
          </h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email to a friend</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  id="email"
                  placeholder="friend@gmail.com"
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                  value={friendEmail}
                  onChange={(e) => setFriendEmail(e.target.value)}
                />
                <button
                  onClick={sendEmail}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-1 transition-colors shadow-sm hover:shadow-md disabled:opacity-70"
                  disabled={sending || !friendEmail}
                >
                  {sending ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Send
                    </>
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">Only Gmail addresses are currently supported</p>
            </div>
            
            <div>
              <button
                onClick={handleDownload}
                className="w-full bg-white border border-gray-300 hover:border-gray-400 text-gray-700 px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm hover:shadow-md"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download PDF Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SkillInsightCard;