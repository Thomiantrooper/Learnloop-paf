import React, { useState, useEffect, useRef } from "react";
import { FaPaperPlane, FaRobot, FaUser, FaSpinner, FaTimes } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";

const AIChatModal = ({ isOpen, onClose, initialQuery }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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
        const errorData = await response.json();
        console.error("API Error:", errorData);
        throw new Error("Failed to fetch AI response");
      }

      const data = await response.json();
      console.log("API Response:", data);

      if (data.candidates?.[0]?.content?.parts) {
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
          text: "Sorry, I encountered an error. Please try again later.",
          sender: "ai",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (inputText.trim()) {
      const userMessage = { id: Date.now(), text: inputText, sender: "user" };
      setMessages((prev) => [...prev, userMessage]);
      setInputText("");
      fetchAIResponse(inputText);
    }
  };

  useEffect(() => {
    if (initialQuery && isOpen) {
      setMessages([{ id: Date.now(), text: initialQuery, sender: "user" }]);
      fetchAIResponse(initialQuery);
    }
  }, [initialQuery, isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-full">
                  <FaRobot className="text-xl" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">AI Assistant</h2>
                  <p className="text-xs opacity-80">Powered by Gemini</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 transition-colors duration-200"
                aria-label="Close chat"
              >
                <FaTimes />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
                  <FaRobot className="text-4xl mb-2 opacity-50" />
                  <p className="text-lg font-medium">How can I help you today?</p>
                  <p className="text-sm">Ask me anything...</p>
                </div>
              )}

              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`flex items-start gap-3 max-w-[90%] ${
                      message.sender === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full ${
                        message.sender === "user"
                          ? "bg-blue-500"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    >
                      {message.sender === "user" ? (
                        <FaUser className="text-white" />
                      ) : (
                        <FaRobot className="text-gray-800 dark:text-gray-200" />
                      )}
                    </div>
                    <div
                      className={`p-4 rounded-2xl ${
                        message.sender === "user"
                          ? "bg-blue-500 text-white rounded-tr-none"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-tl-none"
                      }`}
                    >
                      <ReactMarkdown
                        components={{
                          p: ({ node, ...props }) => (
                            <p className="mb-3 last:mb-0" {...props} />
                          ),
                          strong: ({ node, ...props }) => (
                            <strong
                              className={`font-semibold ${
                                message.sender === "user"
                                  ? "text-white"
                                  : "text-gray-900 dark:text-white"
                              }`}
                              {...props}
                            />
                          ),
                          em: ({ node, ...props }) => (
                            <em className="italic" {...props} />
                          ),
                          ul: ({ node, ...props }) => (
                            <ul className="list-disc pl-5 mb-3" {...props} />
                          ),
                          ol: ({ node, ...props }) => (
                            <ol className="list-decimal pl-5 mb-3" {...props} />
                          ),
                          li: ({ node, ...props }) => (
                            <li className="mb-1" {...props} />
                          ),
                          code: ({ node, ...props }) => (
                            <code
                              className="bg-black/20 dark:bg-white/20 px-1.5 py-0.5 rounded text-sm font-mono"
                              {...props}
                            />
                          ),
                          a: ({ node, ...props }) => (
                            <a
                              className={`underline ${
                                message.sender === "user"
                                  ? "text-blue-100 hover:text-white"
                                  : "text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                              }`}
                              target="_blank"
                              rel="noopener noreferrer"
                              {...props}
                            />
                          ),
                        }}
                      >
                        {message.text}
                      </ReactMarkdown>
                    </div>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                      <FaRobot className="text-gray-800 dark:text-gray-200" />
                    </div>
                    <div className="p-4 rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-tl-none">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <textarea
                    placeholder="Type your message..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500 transition-all duration-200 resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    rows="1"
                    style={{ minHeight: "44px", maxHeight: "120px" }}
                  />
                  <button
                    onClick={() => {
                      if (inputText.trim()) handleSendMessage();
                    }}
                    disabled={!inputText.trim()}
                    className={`absolute right-3 bottom-3 p-1.5 rounded-full ${
                      inputText.trim()
                        ? "bg-blue-500 text-white hover:bg-blue-600"
                        : "text-gray-400 dark:text-gray-500"
                    } transition-colors duration-200`}
                  >
                    <FaPaperPlane />
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                AI may produce inaccurate information. Consider verifying important details.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AIChatModal;