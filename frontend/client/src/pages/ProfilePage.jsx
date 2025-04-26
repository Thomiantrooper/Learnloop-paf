// src/pages/ProfilePage.jsx
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

const ProfilePage = () => {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
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

  useEffect(() => {
    const fetchProfileAndPosts = async () => {
      try {
        const profileResponse = await axios.get(`http://localhost:8080/api/profile/public/${userId}`);
        setProfile(profileResponse.data);
        if (profileResponse.data.followers && profileResponse.data.followers.includes(loggedInUserId)) {
          setIsFollowing(true);
        }
        const postsResponse = await axios.get(`http://localhost:8080/api/posts/user/${userId}`);
        setPosts(postsResponse.data);
      } catch (err) {
        setError("Failed to load profile or posts.");
        console.error("Error:", err);
      }
    };
    fetchProfileAndPosts();

    connectWebSocket(loggedInUserId, (update) => {
      if (update.userId === userId) {
        setProfile((prevProfile) => ({
          ...prevProfile,
          profilePicturePath: update.profilePicturePath,
        }));
      }
    });

    return () => disconnectWebSocket();
  }, [userId, loggedInUserId]);

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
    setShowPostForm(false);
    setProfile({ ...profile, posts: [newPost.id, ...profile.posts] });
  };

  const handleLike = async (postId) => {
    try {
      await axios.post(`http://localhost:8080/api/posts/${postId}/like`, { userId: loggedInUserId });
      const postsResponse = await axios.get(`http://localhost:8080/api/posts/user/${userId}`);
      setPosts(postsResponse.data);
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  const handleDelete = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await axios.delete(`http://localhost:8080/api/posts/${postId}`, { params: { userId: loggedInUserId } });
        setPosts(posts.filter((p) => p.id !== postId));
        setProfile({ ...profile, posts: profile.posts.filter((id) => id !== postId) });
      } catch (err) {
        console.error("Error deleting post:", err);
      }
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
    setPosts(posts.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
  };

  if (error) return <div className="text-red-500 text-center mt-8">{error}</div>;
  if (!profile) return <div><Lottie animationData={animationData} loop={true} /></div>;

  return (
    <div className="min-h-screen bg-gray-100 py-8">
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

      {showPostForm && loggedInUserId === userId && (
        <div className="max-w-4xl mx-auto p-4">
          <PostForm userId={loggedInUserId} onPostCreated={handlePostCreated} />
        </div>
      )}

      <div className="max-w-4xl mx-auto p-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Posts</h2>
        {posts.length > 0 ? (
          <div className="space-y-6">
            {posts.map((post) => (
              <div key={post.id} className="bg-white p-6 rounded-lg shadow-md">
                {editingPostId === post.id ? (
                  <div className="mb-4">
                    <textarea
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                    />
                    <div className="mt-2 flex space-x-2">
                      <button
                        onClick={() => handleUpdateSubmit(post.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingPostId(null)}
                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-700 mb-4">{post.description}</p>
                )}
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
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center space-x-2 text-gray-600 hover:text-blue-600"
                  >
                    <span>👍</span>
                    <span>{post.likes.length} Likes</span>
                  </button>
                  {loggedInUserId === userId && (
                    <>
                      <button
                        onClick={() => handleUpdate(post)}
                        className="text-gray-600 hover:text-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="text-gray-600 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
                <CommentSection post={post} loggedInUserId={loggedInUserId} onPostUpdate={handlePostUpdate} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center">No posts yet.</p>
        )}
      </div>

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