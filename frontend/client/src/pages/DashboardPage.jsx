import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Suggestions from "../components/Suggestions";
import CommentSection from "../components/CommentSection";
import PostForm from "../components/PostForm";
import NotificationBell from "../components/NotificationBell";
import { connectWebSocket, disconnectWebSocket } from "../services/WebSocketService";
import Slider from "react-slick";
import PostMediaCarousel from "../components/PostMediaCarousel";
import Lottie from "lottie-react";
import animationData from "../assets/animations/Animation - 1741896353366.json";


const NextArrow = ({ onClick }) => (
  <div
    className="absolute top-1/2 right-2 transform -translate-y-1/2 z-10 cursor-pointer bg-white rounded-full shadow p-2 hover:bg-indigo-100"
    onClick={onClick}
  >
    <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  </div>
);

const PrevArrow = ({ onClick }) => (
  <div
    className="absolute top-1/2 left-2 transform -translate-y-1/2 z-10 cursor-pointer bg-white rounded-full shadow p-2 hover:bg-indigo-100"
    onClick={onClick}
  >
    <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  </div>
);

const DashboardPage = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPostForm, setShowPostForm] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [focusedPost, setFocusedPost] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
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
    setPosts((prevPosts) =>
      prevPosts.map((p) => (p.id === updatedPost.id ? updatedPost : p))
    );
  
    if (focusedPost?.id === updatedPost.id) {
      setFocusedPost(updatedPost); // Update modal post too
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

  const filteredPosts = activeTab === "all" 
    ? posts 
    : posts.filter(post => post.userId === loggedInUserId);

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
          <div className="w-96 h-96">
            <Lottie animationData={animationData} loop={true} />
          </div>
        </div>
      );
    }
    

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-100">
          <div className="text-red-500 text-xl font-medium mb-4">{error}</div>
          <button 
            onClick={fetchPosts}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 flex">
      {/* Left Sidebar - Navigation */}
      <div className="w-20 xl:w-64 flex-shrink-0 bg-white border-r border-gray-200 hidden lg:flex flex-col items-center xl:items-stretch p-4">
        <Sidebar handleLogout={handleLogout} compact={true} />
      </div>

      {/* Main Content - Center Column */}
      <main className="flex-1 p-4 md:p-6 max-w-2xl mx-auto w-full">
        {/* Header with Tabs */}
        <header className="mb-6 bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Social Feed
            </h1>
            <div className="flex items-center space-x-4">
              <NotificationBell userId={loggedInUserId} />
              <button
                onClick={() => setShowPostForm(true)}
                className="hidden lg:flex items-center px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all"
              >
                <span className="mr-2">+</span> Create Post
              </button>
            </div>
          </div>
          
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
            {["all", "my posts"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab 
                    ? "bg-white shadow-sm text-indigo-600" 
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </header>

        {/* Floating Post Button for Mobile */}
        <div className="lg:hidden fixed bottom-6 right-6 z-30">
          <motion.button
            onClick={() => setShowPostForm(true)}
            className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-blue-600 text-white rounded-full flex items-center justify-center text-2xl shadow-xl hover:shadow-2xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            +
          </motion.button>
        </div>

        {/* Post Form Modal */}
        <AnimatePresence>
          {showPostForm && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-40 p-4"
            >
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{ type: "spring", damping: 25 }}
                className="w-full max-w-2xl"
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

        {/* Feed Section */}
        <section>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <motion.div
                    key={post.id}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
                    whileHover={{ y: -3 }}
                    layout
                  >
                    <div className="p-5">
                      <div className="flex items-start space-x-4 mb-4">
                        <div className="flex-shrink-0 relative">
                          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md">
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
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-gray-800">{post.userName}</h4>
                            <span className="text-xs text-gray-400">
                              {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-gray-500 text-sm">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-4 whitespace-pre-line">{post.description}</p>

                      {post.mediaUrls && post.mediaUrls.length > 0 && (
                      <div className="mb-4 rounded-xl overflow-hidden border border-gray-100">
                        <Slider
                      dots={true}
                      infinite={false}
                      arrows={true}
                      nextArrow={<NextArrow />}
                      prevArrow={<PrevArrow />}
                      className="relative"
                    >

                          {post.mediaUrls.map((url, index) =>
                            url.endsWith(".mp4") ? (
                              <div key={index}>
                                <video 
                                  controls 
                                  className="w-full max-h-96 object-cover bg-black"
                                >
                                  <source src={url} type="video/mp4" />
                                </video>
                              </div>
                            ) : (
                              <div key={index}>
                                <img 
                                  src={url} 
                                  alt={`media-${index}`} 
                                  className="w-full max-h-96 object-cover" 
                                />
                              </div>
                            )
                          )}
                        </Slider>
                      </div>
                    )}



                      <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                      <motion.button
                          onClick={() => handleLike(post.id)}
                          className={`flex items-center space-x-2 text-base font-semibold transition-colors ${
                            post.likes.includes(loggedInUserId) ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-600'
                          }`}
                          whileTap={{ scale: 0.95 }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                          </svg>
                          <span>{post.likes.length} {post.likes.length === 1 ? 'Like' : 'Likes'}</span>
                        </motion.button>


                        <button 
                          onClick={() => handleViewAllComments(post)}
                          className="text-gray-600 hover:text-indigo-600 flex items-center space-x-2 px-4 py-2 rounded-full hover:bg-gray-50"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm font-medium">
                            {post.comments.length} {post.comments.length === 1 ? 'Comment' : 'Comments'}
                          </span>
                        </button>
                      </div>
                    </div>

                    {post.comments.length > 0 && (
                      <div className="border-t border-gray-100 px-5 py-3 bg-gray-50">
                        <div className="space-y-3">
                          {post.comments.slice(0, 2).map((comment) => (
                            <div key={comment.id} className="flex items-start space-x-3">
                              <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
                                <img
                                  src={comment.userProfilePicture || `https://i.pravatar.cc/150?u=${comment.userId}`}
                                  alt="User"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1">
                                <div className="bg-white rounded-lg p-3 shadow-xs">
                                  <p className="text-sm font-medium text-gray-800">{comment.userName}</p>
                                  <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                          {post.comments.length > 2 && (
                            <button
                              onClick={() => handleViewAllComments(post)}
                              className="text-sm text-indigo-600 hover:text-indigo-800 mt-2 font-medium"
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
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white p-8 rounded-2xl shadow-sm text-center"
                >
                  <div className="text-gray-300 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-medium text-gray-700 mb-2">No {activeTab === "my posts" ? "your" : ""} posts yet</h4>
                  <p className="text-gray-500 mb-6">Be the first to share something!</p>
                  <button
                    onClick={() => setShowPostForm(true)}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all"
                  >
                    Create Post
                  </button>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </section>
      </main>

      {/* Right Sidebar - Suggestions */}
      <div className="w-80 flex-shrink-0 p-6 bg-white border-l border-gray-200 hidden xl:block">
        <div className="sticky top-6 space-y-6">
          {/* <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-5 shadow-xs">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Welcome back!</h3>
            <p className="text-gray-600 text-sm mb-4">Check out what's new in your network.</p>
            <button className="w-full py-2.5 bg-white text-indigo-600 rounded-lg text-sm font-medium shadow-xs hover:shadow-sm transition-all border border-indigo-100">
              Explore
            </button>
          </div> */}

          <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-100">
            {/* <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Suggestions For You</h3>
              <button className="text-indigo-600 text-sm font-medium hover:text-indigo-800">See All</button>
            </div> */}
            <Suggestions loggedInUserId={loggedInUserId} />
          </div>

          <div className="bg-gray-50 rounded-2xl p-5 shadow-xs border border-gray-100">
            <h4 className="font-bold text-gray-800 mb-3">Trending Topics</h4>
            <div className="space-y-3">
              {['#TechTalk', '#DesignLife', '#DevCommunity', '#UXTrends'].map(tag => (
                <motion.div 
                  key={tag} 
                  whileHover={{ x: 2 }}
                  className="text-sm text-indigo-600 hover:text-indigo-800 cursor-pointer flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                  {tag}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Comments Modal */}
      <AnimatePresence>
        {showAllComments && focusedPost && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white rounded-2xl w-full max-w-6xl h-[90vh] flex overflow-hidden shadow-2xl"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
            >
              {/* Post Content */}
              <div className="w-1/2 p-6 overflow-y-auto border-r border-gray-200">
                <button 
                  onClick={handleCloseCommentsView}
                  className="mb-4 text-gray-500 hover:text-gray-700 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to feed
                </button>
                
                <div className="bg-white p-6 rounded-xl shadow-xs border border-gray-100">
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
                      className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
                        focusedPost.likes.includes(loggedInUserId) 
                          ? 'text-indigo-600 bg-indigo-50' 
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                      whileTap={{ scale: 0.95 }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-medium">
                        {focusedPost.likes.length} {focusedPost.likes.length === 1 ? 'Like' : 'Likes'}
                      </span>
                    </motion.button>
                  </div>
                </div>
              </div>
              
              {/* Comments Section */}
              <div className="w-1/2 p-6 overflow-y-auto">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
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