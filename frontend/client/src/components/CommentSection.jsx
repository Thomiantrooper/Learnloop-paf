import React, { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import EmojiPicker from "emoji-picker-react";

const CommentSection = ({ post, loggedInUserId, onPostUpdate }) => {
  const [commenting, setCommenting] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const textareaRef = useRef(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Add new comment
  const handleComment = async () => {
    if (!commentContent.trim()) {
      setError("Comment cannot be empty");
      return;
    }

    if (!token) {
      navigate("/error", {
        state: {
          status: "401",
          message: "Authentication Required",
          details: "Please log in to comment.",
        },
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(
        `http://localhost:8080/api/posts/${post.id}/comment`,
        {
          userId: loggedInUserId,
          content: commentContent,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      onPostUpdate(response.data);
      setCommenting(false);
      setCommentContent("");
      setError("");
    } catch (err) {
      console.error("Error commenting:", err);
      setError(err.response?.data || "Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update existing comment
  const handleUpdateComment = async (commentId) => {
    if (!editingContent.trim()) {
      setError("Comment cannot be empty");
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:8080/api/posts/${post.id}/comment/${commentId}`,
        {
          userId: loggedInUserId,
          content: editingContent,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      onPostUpdate(response.data);
      setEditingCommentId(null);
      setEditingContent("");
      setError("");
    } catch (err) {
      console.error("Error updating comment:", err);
      setError(err.response?.data || "Failed to update comment");
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;

    try {
      const response = await axios.delete(
        `http://localhost:8080/api/posts/${post.id}/comment/${commentId}`,
        {
          params: { userId: loggedInUserId },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      onPostUpdate(response.data);
    } catch (err) {
      console.error("Error deleting comment:", err);
      setError(err.response?.data || "Failed to delete comment");
    }
  };

  const handleEmojiClick = (emojiData) => {
    const cursorPosition = textareaRef.current.selectionStart;
    const newContent =
      commentContent.substring(0, cursorPosition) +
      emojiData.emoji +
      commentContent.substring(cursorPosition);
    setCommentContent(newContent);
    setShowEmojiPicker(false);
    setTimeout(() => {
      textareaRef.current.focus();
      textareaRef.current.selectionStart = cursorPosition + emojiData.emoji.length;
      textareaRef.current.selectionEnd = cursorPosition + emojiData.emoji.length;
    }, 0);
  };

  return (
    <div className="mt-6">
      {/* Comment Toggle Button */}
      <button
        onClick={() => setCommenting(!commenting)}
        className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-800 transition-colors"
      >
        <span className="text-xl">💬</span>
        <span className="font-medium">
          {post.comments.length} {post.comments.length === 1 ? "Comment" : "Comments"}
        </span>
      </button>

      {/* Comment Input Section */}
      {commenting && (
        <div className="mt-4 space-y-3 animate-fadeIn">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="Add a comment..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              rows="3"
            />
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="absolute right-3 bottom-3 text-gray-500 hover:text-indigo-600 transition-colors"
              type="button"
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
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
          </div>

          {showEmojiPicker && (
            <div className="absolute z-10">
              <EmojiPicker onEmojiClick={handleEmojiClick} width={300} height={350} />
            </div>
          )}

          {error && (
            <p className="text-red-500 text-sm px-2 py-1 bg-red-50 rounded-md">{error}</p>
          )}

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setCommenting(false);
                setCommentContent("");
                setError("");
              }}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleComment}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isSubmitting
                  ? "bg-indigo-300 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Posting...
                </span>
              ) : (
                "Post Comment"
              )}
            </button>
          </div>
        </div>
      )}

      {/* Comments List */}
      <div className="mt-4 space-y-4">
        {post.comments.map((comment) => (
          <div
            key={comment.id}
            className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {editingCommentId === comment.id ? (
              <div className="space-y-3">
                <div className="relative">
                  <textarea
                    defaultValue={comment.content}
                    onChange={(e) => setEditingContent(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    rows="3"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setEditingCommentId(null)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleUpdateComment(comment.id)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                  >
                    Update
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-indigo-700">{comment.userName}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-1 text-gray-800 whitespace-pre-wrap">{comment.content}</p>
                </div>
                {comment.userId === loggedInUserId && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingCommentId(comment.id);
                        setEditingContent(comment.content);
                      }}
                      className="text-indigo-600 hover:text-indigo-800 transition-colors"
                      title="Edit"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                      title="Delete"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentSection;