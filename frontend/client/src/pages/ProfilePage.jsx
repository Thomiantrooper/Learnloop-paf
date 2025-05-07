import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import Lottie from "lottie-react";
import animationData from "../assets/animations/Animation - 1741896353366.json";
import ProfileHeader from "../components/ProfileHeader";
import FollowingModal from "../components/FollowingModal";
import PostForm from "../components/PostForm";
import CommentSection from "../components/CommentSection";
import FollowersModal from "../components/FollowersModal";
import { connectWebSocket, disconnectWebSocket } from "../services/WebSocketService";
import { motion, AnimatePresence } from "framer-motion";
import Slider from "react-slick";


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


const ProfilePage = () => {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followingUsers, setFollowingUsers] = useState([]);
  const [showPostForm, setShowPostForm] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const [newDescription, setNewDescription] = useState("");
  const loggedInUserId = localStorage.getItem("userId");
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [focusedPost, setFocusedPost] = useState(null);
  const [showAllComments, setShowAllComments] = useState(false);

  useEffect(() => {
    const fetchProfileAndPosts = async () => {
      try {
        setLoading(true);
        const [profileResponse, postsResponse] = await Promise.all([
          axios.get(`http://localhost:8080/api/profile/public/${userId}`),
          axios.get(`http://localhost:8080/api/posts/user/${userId}`)
        ]);
        
        setProfile(profileResponse.data);
        setIsFollowing(profileResponse.data.followers?.includes(loggedInUserId) || false);
        setPosts(postsResponse.data);
      } catch (err) {
        setError("Failed to load profile or posts.");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfileAndPosts();

    connectWebSocket(loggedInUserId, (update) => {
      if (update.userId === userId) {
        setProfile(prev => ({
          ...prev,
          profilePicturePath: update.profilePicturePath,
        }));
      }
    });

    return () => disconnectWebSocket();
  }, [userId, loggedInUserId]);

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
    setShowPostForm(false);
    setProfile(prev => ({ 
      ...prev, 
      posts: [newPost.id, ...(prev.posts || [])] 
    }));
  };

  const handleLike = async (postId) => {
    try {
      const updatedPosts = posts.map(p => {
        if (p.id === postId) {
          const alreadyLiked = p.likes.includes(loggedInUserId);
          return {
            ...p,
            likes: alreadyLiked 
              ? p.likes.filter(id => id !== loggedInUserId)
              : [...p.likes, loggedInUserId]
          };
        }
        return p;
      });
      setPosts(updatedPosts);
      
      if (focusedPost && focusedPost.id === postId) {
        setFocusedPost(updatedPosts.find(p => p.id === postId));
      }

      await axios.post(`http://localhost:8080/api/posts/${postId}/like`, { userId: loggedInUserId });
    } catch (err) {
      console.error("Error liking post:", err);
      const originalPosts = await axios.get(`http://localhost:8080/api/posts/user/${userId}`);
      setPosts(originalPosts.data);
    }
  };

  const handleDelete = async (postId) => {
    // if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await axios.delete(`http://localhost:8080/api/posts/${postId}`, { 
          params: { userId: loggedInUserId } 
        });
        setPosts(posts.filter(p => p.id !== postId));
        setProfile(prev => ({
          ...prev,
          posts: prev.posts.filter(id => id !== postId)
        }));
      } catch (err) {
        console.error("Error deleting post:", err);
      }
    
  };

  const handleUpdate = (post) => {
    setEditingPostId(post.id);
    setNewDescription(post.description);
  };

  const handleUpdateSubmit = async (postId) => {
    const formData = new FormData();
    formData.append("description", newDescription);
    formData.append("userId", loggedInUserId);
    try {
      const response = await axios.put(`http://localhost:8080/api/posts/${postId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPosts(posts.map((p) => (p.id === postId ? response.data : p)));
      setEditingPostId(null);
      setNewDescription("");
    } catch (err) {
      console.error("Error updating post:", err);
    }
  };

  const handlePostUpdate = (updatedPost) => {
    setPosts(posts.map(p => p.id === updatedPost.id ? updatedPost : p));
    if (focusedPost && focusedPost.id === updatedPost.id) {
      setFocusedPost(updatedPost);
    }
  };

  const handleViewAllComments = (post) => {
    setFocusedPost(post);
    setShowAllComments(true);
  };

  const handleCloseCommentsView = () => {
    setShowAllComments(false);
    setFocusedPost(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50">
        <div className="w-96 h-96">
          <Lottie animationData={animationData} loop={true} />
        </div>
      </div>
    );
  }

  if (error) return <div className="text-red-500 text-center mt-8">{error}</div>;
  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 pb-12">
      <ProfileHeader
        profile={profile}
        setProfile={setProfile}
        loggedInUserId={loggedInUserId}
        userId={userId}
        isFollowing={isFollowing}
        setIsFollowing={setIsFollowing}
        setShowPostForm={setShowPostForm}
        setShowFollowingModal={setShowFollowingModal}
        setFollowingUsers={setFollowingUsers}
        setShowFollowersModal={setShowFollowersModal}
        setFollowers={setFollowers}
      />

      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Posts
          </h2>
        </div>

        {posts.length > 0 ? (
          <div className="space-y-6">
            {posts.map((post) => (
              <motion.div
                key={post.id}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md">
                      <img
                        src={post.profilePicturePath || `https://i.pravatar.cc/150?u=${post.userId}`}
                        alt="User"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-indigo-500 rounded-full p-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{post.userName}</h4>
                    <p className="text-sm text-gray-500">{new Date(post.createdAt).toLocaleString()}</p>
                  </div>
                  
                  {loggedInUserId === userId && (
                    <div className="ml-auto flex space-x-2">
                      <button
                        onClick={() => handleUpdate(post)}
                        className="text-gray-500 hover:text-indigo-600 transition-colors"
                        title="Edit"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="text-gray-500 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                {editingPostId === post.id ? (
                  <div className="mb-4">
                    <textarea
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      rows="3"
                    />
                    <div className="mt-3 flex space-x-3">
                      <button
                        onClick={() => handleUpdateSubmit(post.id)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => setEditingPostId(null)}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-700 mb-4 whitespace-pre-line">{post.description}</p>
                )}

                  <Slider
                    dots={true}
                    infinite={false}
                    arrows={true}
                    nextArrow={<NextArrow />}
                    prevArrow={<PrevArrow />}
                    className="relative mb-4 rounded-xl overflow-hidden border border-gray-100"
                  >
                    {post.mediaUrls.map((url, index) =>
                      url.endsWith(".mp4") ? (
                        <div key={index}>
                          <video controls className="w-full max-h-96 object-cover bg-black">
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
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-8 text-center shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h4 className="text-xl font-medium text-gray-700 mb-2">No posts yet</h4>
            <p className="text-gray-500">
              {loggedInUserId === userId ? "Share your first post!" : "This user hasn't posted anything yet."}
            </p>
          </div>
        )}
      </div>

      {/* Blue Floating Create Post Button */}
      {loggedInUserId === userId && (
        <motion.button
          onClick={() => setShowPostForm(true)}
          className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-xl hover:bg-blue-700 transition-all duration-300 z-40 flex items-center justify-center"
          style={{
            boxShadow: "0 4px 20px rgba(37, 99, 235, 0.5)"
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </motion.button>
      )}

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
              className="bg-white rounded-xl w-full max-w-2xl"
            >
              <PostForm 
                userId={loggedInUserId} 
                onPostCreated={handlePostCreated}
                onClose={() => setShowPostForm(false)}
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

      {showFollowingModal && (
        <FollowingModal
          followingUsers={followingUsers}
          onClose={() => setShowFollowingModal(false)}
          loggedInUserId={loggedInUserId}
          setProfile={setProfile}
        />
      )}

      {showFollowersModal && (
        <FollowersModal
          followers={followers}
          onClose={() => setShowFollowersModal(false)}
          loggedInUserId={loggedInUserId}
          setProfile={setProfile}
        />
      )}
    </div>
  );
};

export default ProfilePage;