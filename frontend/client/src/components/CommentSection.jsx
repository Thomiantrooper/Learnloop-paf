import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import EmojiPicker from "emoji-picker-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { Avatar } from "./Avatar";

const CommentSection = ({ post, loggedInUserId, onPostUpdate, autoFocus = false, condensed = false }) => {
  const [commentContent, setCommentContent] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const textareaRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      const payload = {
        userId: loggedInUserId,
        content: commentContent,
      };

      if (replyingTo) {
        payload.parentId = replyingTo;
      }

      const response = await axios.post(
        `http://localhost:8080/api/posts/${post.id}/comment`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      onPostUpdate(response.data);
      setCommentContent("");
      setError("");
      setReplyingTo(null);
    } catch (err) {
      console.error("Error commenting:", err);
      setError(err.response?.data || "Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const handleDeleteComment = async (commentId) => {
    // if (!window.confirm("Are you sure you want to delete this comment?")) return;

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

  const startReply = (commentId, userName) => {
    setReplyingTo(commentId);
    setCommentContent(`@${userName} `);
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const renderComment = (comment, isChild = false) => (
    <motion.div
      key={comment.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`p-3 ${isChild ? 'ml-8 border-l-2 border-gray-200' : 'bg-white rounded-lg'} mb-3`}
    >
      <div className="flex items-start space-x-3">
        <Avatar 
          src={comment.userProfilePicture || `https://i.pravatar.cc/150?u=${comment.userId}`}
          size={condensed ? "xs" : "sm"}
          className="mt-1"
        />
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className={`${condensed ? 'text-sm' : 'font-semibold'} text-gray-800`}>{comment.userName}</span>
            <span className={`text-xs text-gray-500 ${condensed && 'hidden'}`}>
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
          </div>
          <p className={`mt-1 text-gray-800 whitespace-pre-wrap ${condensed ? 'text-sm' : ''}`}>{comment.content}</p>
          
          {!condensed && (
            <div className="flex items-center mt-2 space-x-4">
              <button 
                onClick={() => startReply(comment.id, comment.userName)}
                className="text-sm text-gray-500 hover:text-indigo-600 transition-colors"
              >
                Reply
              </button>
              {comment.userId === loggedInUserId && (
                <>
                  <button
                    onClick={() => {
                      setEditingCommentId(comment.id);
                      setEditingContent(comment.content);
                    }}
                    className="text-sm text-gray-500 hover:text-indigo-600 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-sm text-gray-500 hover:text-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Replies */}
      {!condensed && comment.replies?.length > 0 && (
        <div className="mt-3">
          {comment.replies.map(reply => renderComment(reply, true))}
        </div>
      )}
    </motion.div>
  );

  if (condensed) {
    return (
      <div className="mt-4">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            placeholder="Write a comment..."
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent resize-none text-sm"
            rows="1"
          />
          <div className="absolute right-2 bottom-2 flex space-x-1">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-gray-500 hover:text-indigo-600 transition-colors"
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <button
              onClick={handleComment}
              disabled={isSubmitting || !commentContent.trim()}
              className={`px-2 py-1 rounded text-sm ${commentContent.trim() ? 'text-indigo-600 hover:text-indigo-800' : 'text-gray-400 cursor-not-allowed'}`}
            >
              Post
            </button>
          </div>
        </div>

        {showEmojiPicker && (
          <div className="absolute z-10" ref={emojiPickerRef}>
            <EmojiPicker 
              onEmojiClick={handleEmojiClick} 
              width={300} 
              height={350}
              searchDisabled
              skinTonesDisabled
              previewConfig={{ showPreview: false }}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mt-6">
      {/* Comment Input Section */}
      <div className="mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          {replyingTo && (
            <div className="mb-2 text-sm text-gray-500">
              Replying to <span className="font-medium text-indigo-600">@{post.comments.find(c => c.id === replyingTo)?.userName}</span>
              <button 
                onClick={() => setReplyingTo(null)} 
                className="ml-2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          )}
          
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="Write your comment..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all"
              rows="3"
            />
            <div className="absolute right-3 bottom-3 flex space-x-2">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="text-gray-500 hover:text-indigo-600 transition-colors"
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
          </div>

          {showEmojiPicker && (
            <div className="absolute z-10" ref={emojiPickerRef}>
              <EmojiPicker 
                onEmojiClick={handleEmojiClick} 
                width={300} 
                height={350}
                searchDisabled
                skinTonesDisabled
                previewConfig={{ showPreview: false }}
              />
            </div>
          )}

          {error && (
            <p className="text-red-500 text-sm px-2 py-1 bg-red-50 rounded-md mt-2">{error}</p>
          )}

          <div className="flex justify-end mt-3">
            <motion.button
              onClick={handleComment}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`px-5 py-2 rounded-lg transition-all ${
                isSubmitting
                  ? "bg-indigo-300 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
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
            </motion.button>
          </div>
        </div>
      </div>

      {/* Editing Comment Section */}
      {editingCommentId && (
        <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-100">
          <div className="relative">
            <textarea
              value={editingContent}
              onChange={(e) => setEditingContent(e.target.value)}
              className="w-full p-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows="3"
            />
          </div>
          <div className="flex justify-end space-x-3 mt-3">
            <button
              onClick={() => setEditingCommentId(null)}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => handleUpdateComment(editingCommentId)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-md"
            >
              Update
            </button>
          </div>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {post.comments.length > 0 ? (
          post.comments
            .filter(comment => !comment.parentId) // Only show top-level comments
            .map(comment => renderComment(comment))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p>No comments yet. Be the first to comment!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;