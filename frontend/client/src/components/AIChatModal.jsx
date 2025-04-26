import React, { useState, useEffect } from "react";
import { FaPaperPlane, FaRobot, FaUser, FaSpinner } from "react-icons/fa";
import ReactMarkdown from "react-markdown"; // For rendering Markdown content

const AIChatModal = ({ isOpen, onClose, initialQuery }) => {
  const [messages, setMessages] = useState([]); // Chat history
  const [inputText, setInputText] = useState(""); // User input
  const [isLoading, setIsLoading] = useState(false); // Loading state

  // Fetch AI response using Gemini API
  const fetchAIResponse = async (query) => {
    setIsLoading(true);
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
                parts: [{ text: query }],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json(); // Log the error response
        console.error("API Error:", errorData);
        throw new Error("Failed to fetch AI response");
      }

      const data = await response.json();
      console.log("API Response:", data); // Log the API response

      // Ensure the response has the expected structure
      if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
        const aiMessage = data.candidates[0].content.parts[0].text;
        setMessages((prev) => [
          ...prev,
          { id: Date.now(), text: aiMessage, sender: "ai" },
        ]);
      } else {
        throw new Error("Unexpected API response format");
      }
    } catch (error) {
      console.error("Error fetching AI response:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: "Failed to fetch AI response. Please try again.",
          sender: "ai",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle sending a message
  const handleSendMessage = () => {
    if (inputText.trim()) {
      const userMessage = { id: Date.now(), text: inputText, sender: "user" };
      setMessages((prev) => [...prev, userMessage]);
      setInputText("");
      fetchAIResponse(inputText);
    }
  };

  // Initialize chat with the initial query
  useEffect(() => {
    if (initialQuery && isOpen) {
      setMessages([{ id: Date.now(), text: initialQuery, sender: "user" }]);
      fetchAIResponse(initialQuery);
    }
  }, [initialQuery, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-2xl max-h-[80vh] flex flex-col">
        {/* Chat Header */}
        <div className="bg-blue-500 text-white p-4 rounded-t-lg flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FaRobot className="text-xl" />
            <h2 className="text-xl font-bold">AI Chatbot</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition duration-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-4 overflow-y-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              } mb-4`}
            >
              <div
                className={`flex items-start gap-2 max-w-[80%] ${
                  message.sender === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-full ${
                    message.sender === "user" ? "bg-blue-500" : "bg-gray-300"
                  }`}
                >
                  {message.sender === "user" ? (
                    <FaUser className="text-white" />
                  ) : (
                    <FaRobot className="text-gray-800" />
                  )}
                </div>
                <div
                  className={`p-3 rounded-lg ${
                    message.sender === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {/* Render Markdown content */}
                  <ReactMarkdown
                    components={{
                      p: ({ node, ...props }) => (
                        <p className="mb-2" {...props} />
                      ),
                      strong: ({ node, ...props }) => (
                        <strong className="font-bold" {...props} />
                      ),
                      em: ({ node, ...props }) => (
                        <em className="italic" {...props} />
                      ),
                      ul: ({ node, ...props }) => (
                        <ul className="list-disc pl-5" {...props} />
                      ),
                      ol: ({ node, ...props }) => (
                        <ol className="list-decimal pl-5" {...props} />
                      ),
                      li: ({ node, ...props }) => (
                        <li className="mb-1" {...props} />
                      ),
                    }}
                  >
                    {message.text}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-300">
                  <FaRobot className="text-gray-800" />
                </div>
                <div className="p-3 rounded-lg bg-gray-100 text-gray-800">
                  <FaSpinner className="animate-spin" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <textarea
              placeholder="Type your message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
              rows="1"
            />
            <button
              onClick={handleSendMessage}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatModal;