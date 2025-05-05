import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import animationData from "../assets/animations/Animation - 1741896353366.json";
import axios from "axios";
import Suggestions from "../components/Suggestions";
import Sidebar from "../components/Sidebar";
import CommentSection from "../components/CommentSection";
import { motion, AnimatePresence } from "framer-motion";
import PostForm from "../components/PostForm";
import { connectWebSocket, disconnectWebSocket } from "../services/WebSocketService";
import NotificationBell from "../components/NotificationBell";
import FloatingCreatePostButton from "../components/FloatingCreatePostButton";

const DashboardPage = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const loggedInUserId = localStorage.getItem("userId");
  const [focusedPost, setFocusedPost] = useState(null);
  const [showAllComments, setShowAllComments] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);

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
    setPosts([newPost, ...posts]);
    setShowPostForm(false);
  };

  const handleLike = async (postId) => {
    try {
      const updatedPosts = posts.map((p) => {
        if (p.id === postId) {
          const alreadyLiked = p.likes.includes(loggedInUserId);
          const newLikes = alreadyLiked
            ? p.likes.filter((id) => id !== loggedInUserId)
            : [...p.likes, loggedInUserId];
          return { ...p, likes: newLikes };
        }
        return p;
      });

      setPosts(updatedPosts);
      
      if (focusedPost && focusedPost.id === postId) {
        setFocusedPost(updatedPosts.find(p => p.id === postId));
      }

      await axios.post(`http://localhost:8080/api/posts/${postId}/like`, { userId: loggedInUserId });
    } catch (err) {
      console.error("Failed to like post:", err);
      fetchPosts();
    }
  };

  const handlePostUpdate = (updatedPost) => {
    setPosts(posts.map(p => {
      if (p.id === updatedPost.id) {
        return { ...p, comments: updatedPost.comments, likes: updatedPost.likes };
      }
      return p;
    }));
    
    if (focusedPost && focusedPost.id === updatedPost.id) {
      setFocusedPost(updatedPost);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  const handleViewAllComments = (post) => {
    setFocusedPost(post);
    setShowAllComments(true);
  };

  const handleCloseCommentsView = () => {
    setShowAllComments(false);
    setFocusedPost(null);
  };

  useEffect(() => {
    if (focusedPost) {
      const currentPost = posts.find(p => p.id === focusedPost.id);
      if (currentPost && JSON.stringify(currentPost.comments) !== JSON.stringify(focusedPost.comments)) {
        setFocusedPost(currentPost);
      }
    }
  }, [posts, focusedPost]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50">
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50">
      <Sidebar handleLogout={handleLogout} />
      
      <div className="ml-64 mr-80">
        <div className="max-w-4xl mx-auto py-8 px-4">
          <header className="flex justify-end items-center mb-8">
            <NotificationBell userId={loggedInUserId} />
          </header>

          <section className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Your Feed
            </h3>
            
            {posts.length > 0 ? (
              posts.map((post) => (
                <motion.div
                  key={post.id}
                  className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ scale: 1.005 }}
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-md">
                        <img
                          src={post.profilePicturePath || `https://i.pravatar.cc/150?u=${post.userId}`}
                          alt="User"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-indigo-500 rounded-full p-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{post.userName}</h4>
                      <p className="text-sm text-gray-500">{new Date(post.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4 whitespace-pre-line">{post.description}</p>
                  
                  {post.mediaUrls && post.mediaUrls.map((url, index) =>
                    url.endsWith(".mp4") ? (
                      <div key={index} className="rounded-xl overflow-hidden mb-4 shadow-md">
                        <video controls className="w-full">
                          <source src={url} type="video/mp4" />
                        </video>
                      </div>
                    ) : (
                      <div key={index} className="rounded-xl overflow-hidden mb-4 shadow-md">
                        <img src={url} alt="Media" className="w-full object-cover max-h-96" />
                      </div>
                    )
                  )}
                  
                  <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                    <motion.button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center space-x-2 ${post.likes.includes(loggedInUserId) ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-600'}`}
                      whileTap={{ scale: 0.95 }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                      <span>{post.likes.length} Likes</span>
                    </motion.button>
                    <button 
                      onClick={() => handleViewAllComments(post)}
                      className="text-gray-500 hover:text-indigo-600 flex items-center space-x-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                      </svg>
                      <span>{post.comments.length} Comments</span>
                    </button>
                  </div>
                  
                  {post.comments.length > 0 && (
                    <div className="mt-4 border-t border-gray-100 pt-4">
                      <div className="space-y-3">
                        {post.comments.slice(0, 2).map((comment) => (
                          <div key={comment.id} className="flex items-start space-x-3">
                            <div className="w-8 h-8 rounded-full overflow-hidden">
                              <img
                                src={comment.userProfilePicture || `https://i.pravatar.cc/150?u=${comment.userId}`}
                                alt="User"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-sm font-medium text-gray-800">{comment.userName}</p>
                                <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                        {post.comments.length > 2 && (
                          <button
                            onClick={() => handleViewAllComments(post)}
                            className="text-sm text-indigo-600 hover:text-indigo-800 mt-2"
                          >
                            View all {post.comments.length} comments
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <CommentSection 
                    post={post} 
                    loggedInUserId={loggedInUserId} 
                    onPostUpdate={handlePostUpdate}
                    condensed={true}
                  />
                </motion.div>
              ))
            ) : (
              <div className="bg-white rounded-xl p-8 text-center shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h4 className="text-xl font-medium text-gray-700 mb-2">No posts yet</h4>
                <p className="text-gray-500">Be the first to share something!</p>
              </div>
            )}
          </section>
        </div>
      </div>
      
      <div className="fixed right-0 top-0 h-screen w-80 bg-white shadow-lg overflow-y-auto py-8 px-6 border-l border-gray-100">
        <Suggestions loggedInUserId={loggedInUserId} />
      </div>

      <FloatingCreatePostButton 
        onClick={() => setShowPostForm(true)}
      />

      <AnimatePresence>
        {showPostForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: -20 }}
              className="w-full max-w-3xl"
            >
              <PostForm 
                userId={loggedInUserId} 
                onPostCreated={handlePostCreated}
                onClose={() => setShowPostForm(false)}
                isLarge={true}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAllComments && focusedPost && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white rounded-xl w-full max-w-6xl h-[90vh] flex overflow-hidden"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="w-1/2 p-6 overflow-y-auto border-r border-gray-200">
                <button 
                  onClick={handleCloseCommentsView}
                  className="mb-4 text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-md">
                        <img
                          src={focusedPost.profilePicturePath || `https://i.pravatar.cc/150?u=${focusedPost.userId}`}
                          alt="User"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-indigo-500 rounded-full p-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{focusedPost.userName}</h4>
                      <p className="text-sm text-gray-500">{new Date(focusedPost.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4 whitespace-pre-line">{focusedPost.description}</p>
                  
                  {focusedPost.mediaUrls && focusedPost.mediaUrls.map((url, index) =>
                    url.endsWith(".mp4") ? (
                      <div key={index} className="rounded-xl overflow-hidden mb-4 shadow-md">
                        <video controls className="w-full">
                          <source src={url} type="video/mp4" />
                        </video>
                      </div>
                    ) : (
                      <div key={index} className="rounded-xl overflow-hidden mb-4 shadow-md">
                        <img src={url} alt="Media" className="w-full object-cover max-h-96" />
                      </div>
                    )
                  )}
                  
                  <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                    <motion.button
                      onClick={() => handleLike(focusedPost.id)}
                      className={`flex items-center space-x-2 ${focusedPost.likes.includes(loggedInUserId) ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-600'}`}
                      whileTap={{ scale: 0.95 }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                      <span>{focusedPost.likes.length} Likes</span>
                    </motion.button>
                  </div>
                </div>
              </div>
              
              <div className="w-1/2 p-6 overflow-y-auto">
                <h3 className="text-xl font-bold text-gray-800 mb-6">
                  {focusedPost.comments.length} Comments
                </h3>
                
                <CommentSection 
                  post={focusedPost} 
                  loggedInUserId={loggedInUserId} 
                  onPostUpdate={handlePostUpdate}
                  autoFocus={true}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardPage;