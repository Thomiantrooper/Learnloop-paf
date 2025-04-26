import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import animationData from "../assets/animations/Animation - 1741896353366.json";
import axios from "axios";
import Suggestions from "../components/Suggestions";
import Sidebar from "../components/Sidebar";
import CommentSection from "../components/CommentSection";
import { motion } from "framer-motion";
import PostForm from "../components/PostForm";
import { connectWebSocket, disconnectWebSocket } from "../services/WebSocketService";

const DashboardPage = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPostForm, setShowPostForm] = useState(false);
  const loggedInUserId = localStorage.getItem("userId");

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/posts/feed?userId=${loggedInUserId}`);
      setPosts(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to load posts: " + err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    connectWebSocket(loggedInUserId, (update) => {
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.userId === update.userId
            ? { ...post, profilePicturePath: update.profilePicturePath }
            : post
        )
      );
    });
    return () => disconnectWebSocket();
  }, [loggedInUserId]);

  const handlePostCreated = (newPost) => {
    setShowPostForm(false);
    fetchPosts();
  };

  const handleLike = async (postId) => {
    try {
      await axios.post(`http://localhost:8080/api/posts/${postId}/like`, { userId: loggedInUserId });
      fetchPosts();
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  const handlePostUpdate = (updatedPost) => {
    setPosts(posts.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-96 h-96">
          <Lottie animationData={animationData} loop={true} />
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center mt-8">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-teal-500 to-blue-500 flex">
      <div className="w-1/4 flex flex-col p-4 space-y-4 bg-white shadow-lg">
        <Sidebar handleLogout={handleLogout} />
        <Suggestions loggedInUserId={loggedInUserId} />
      </div>
      <main className="flex-1 p-8 bg-white rounded-lg shadow-lg">
        <header className="flex justify-between items-center mb-8">
          <button
            onClick={() => setShowPostForm(true)}
            className="w-12 h-12 Bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl hover:bg-blue-700"
          >
            +
          </button>
          
        </header>

        {showPostForm && <PostForm userId={loggedInUserId} onPostCreated={handlePostCreated} />}

        <section className="mt-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Feed</h3>
          <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
            {posts.length > 0 ? (
              posts.map((post) => (
                <motion.div
                  key={post.id}
                  className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-sky-400 p-1">
                      <img
                        src={post.profilePicturePath || `https://i.pravatar.cc/150?u=${post.userId}`}
                        alt="User"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{post.userName}</h4>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4">{post.description}</p>
                  {post.mediaUrls &&
                    post.mediaUrls.map((url, index) =>
                      url.endsWith(".mp4") ? (
                        <video key={index} controls className="w-full rounded-lg mb-4">
                          <source src={url} type="video/mp4" />
                        </video>
                      ) : (
                        <img key={index} src={url} alt="Media" className="w-full rounded-lg mb-4" />
                      )
                    )}
                  <div className="flex items-center justify-between border-t pt-4">
                    <motion.button
                      onClick={() => handleLike(post.id)}
                      className="flex items-center space-x-2 text-gray-600 hover:text-blue-600"
                      whileTap={{ scale: 0.95 }}
                    >
                      <span>👍</span>
                      <span>{post.likes.length} Likes</span>
                    </motion.button>
                  </div>
                  <CommentSection post={post} loggedInUserId={loggedInUserId} onPostUpdate={handlePostUpdate} />
                </motion.div>
              ))
            ) : (
              <p className="text-gray-600 text-center">No posts to show.</p>
            )}
          </motion.div>
        </section>
      </main>
    </div>
  );
};

export default DashboardPage;