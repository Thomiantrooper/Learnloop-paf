import React, { useState } from "react";
import { motion } from "framer-motion";
import PostForm from "./PostForm";

const FloatingCreatePostButton = ({ userId, onPostCreated }) => {
  const [showPostForm, setShowPostForm] = useState(false);

  return (
    <>
      <motion.button
        onClick={() => setShowPostForm(true)}
        className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-xl hover:bg-blue-700 transition-all duration-300 z-40 flex items-center justify-center"
        style={{
          boxShadow: "0 4px 20px rgba(59, 130, 246, 0.5)"
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </motion.button>

      {showPostForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <PostForm 
            userId={userId} 
            onPostCreated={(newPost) => {
              onPostCreated(newPost);
              setShowPostForm(false);
            }} 
            onClose={() => setShowPostForm(false)}
          />
        </motion.div>
      )}
    </>
  );
};

export default FloatingCreatePostButton;