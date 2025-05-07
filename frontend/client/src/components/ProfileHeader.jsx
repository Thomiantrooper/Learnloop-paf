import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import defaultProfilePic from "../assets/default-profile-pic.jpg";

const ProfileHeader = ({
  profile,
  setProfile,
  loggedInUserId,
  userId,
  isFollowing,
  setIsFollowing,
  setShowPostForm,
  setShowFollowingModal,
  setFollowingUsers,
  setShowFollowersModal, 
  setFollowers,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [newName, setNewName] = useState(profile?.name || "");
  const [newBio, setNewBio] = useState(profile?.bio || "");
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  
  const allowedImageTypes = ["image/png", "image/jpeg", "image/jpg"];
  const maxImageSize = 2 * 1024 * 1024; // 2MB

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!allowedImageTypes.includes(file.type)) {
      setError("Invalid file type. Only PNG, JPG, and JPEG are allowed.");
      setProfilePicFile(null);
      return;
    }

    // Validate file size
    if (file.size > maxImageSize) {
      setError("File size exceeds 2MB limit.");
      setProfilePicFile(null);
      return;
    }

    setProfilePicFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError("");
  };

  const handleProfilePicUpload = async () => {
    if (!profilePicFile) return;
    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", profilePicFile);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:8080/api/profile/${userId}/upload-profile-picture`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${token}`,
          },
        }
      );
      const updatedProfile = await axios.get(`http://localhost:8080/api/profile/public/${userId}`);
      setProfile(updatedProfile.data);
      setProfilePicFile(null);
      setPreviewUrl(null);
      setError("");
    } catch (err) {
      setError("Error uploading profile picture: " + (err.response?.data || err.message));
      console.error("Error uploading profile picture:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:8080/api/profile/${userId}/update`,
        null,
        {
          params: { name: newName, bio: newBio },
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        }
      );
      setProfile(response.data);
      setIsEditingProfile(false);
    } catch (err) {
      setError("Error updating profile: " + (err.response?.data || err.message));
      console.error("Error updating profile:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBio = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8080/api/profile/${userId}/bio`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      setProfile({ ...profile, bio: null });
      setNewBio("");
    } catch (err) {
      setError("Error deleting bio: " + (err.response?.data || err.message));
      console.error("Error deleting bio:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollow = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:8080/api/profile/${userId}/follow`,
        null,
        {
          params: { followerId: loggedInUserId },
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        }
      );
      setIsFollowing(true);
      setProfile({ ...profile, followers: [...(profile.followers || []), loggedInUserId] });
    } catch (err) {
      setError("Error following user: " + (err.response?.data || err.message));
      console.error("Error following user:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowersClick = async () => {
    try {
      const token = localStorage.getItem("token");
      const idsParam = profile.followers.join(',');
      const response = await axios.get(`http://localhost:8080/api/profile/followers`, {
        params: { ids: idsParam },
        headers: { "Authorization": `Bearer ${token}` },
      });
      setFollowers(response.data);
      setShowFollowersModal(true);
    } catch (err) {
      console.error("Error fetching followers:", err);
    }
  };

  const handleUnfollow = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:8080/api/profile/${userId}/unfollow`,
        null,
        {
          params: { followerId: loggedInUserId },
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        }
      );
      setIsFollowing(false);
      setProfile({ ...profile, followers: profile.followers.filter((id) => id !== loggedInUserId) });
    } catch (err) {
      setError("Error unfollowing user: " + (err.response?.data || err.message));
      console.error("Error unfollowing user:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowingClick = async () => {
    try {
      const token = localStorage.getItem("token");
      const idsParam = profile.following.join(',');
      
      const response = await axios.get(`http://localhost:8080/api/profile/following`, {
        params: { ids: idsParam },
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      setFollowingUsers(response.data);
      setShowFollowingModal(true);
    } catch (err) {
      setError("Error fetching following users: " + (err.response?.data || err.message));
      console.error("Error fetching following users:", err);
    }
  };

  const profilePicUrl = previewUrl || profile?.profilePicturePath || defaultProfilePic;

  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl shadow-lg mx-4 md:mx-8 mb-8 overflow-hidden"
    >
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-32 w-full"></div>
      
      <div className="px-6 pb-6 relative">
        <div className="flex flex-col md:flex-row items-start md:items-end -mt-20 relative">
          <div className="relative group">
            <div className="w-40 h-40 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
              <img
                src={profilePicUrl}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = defaultProfilePic;
                }}
              />
            </div>
            
            {loggedInUserId === userId && (
              <>
                <div className="absolute inset-0 bg-black bg-opacity-30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleProfilePicChange}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                />
              </>
            )}
          </div>
          
          <div className="mt-4 md:mt-0 md:ml-6 flex-1">
            {isEditingProfile ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-3 text-xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your name"
                />
                <textarea
                  value={newBio}
                  onChange={(e) => setNewBio(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tell us about yourself..."
                  rows="3"
                />
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleProfileUpdate}
                    disabled={isLoading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => setIsEditingProfile(false)}
                    className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  {profile.bio && (
                    <button
                      onClick={handleDeleteBio}
                      disabled={isLoading}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      Remove Bio
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
                <p className="text-gray-600 mt-2 max-w-2xl whitespace-pre-line">
                  {profile.bio || "No bio yet"}
                </p>
                
                {loggedInUserId === userId && (
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="mt-3 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Edit Profile
                  </button>
                )}
              </div>
            )}
            
            {loggedInUserId === userId && (profilePicFile || error) && (
              <div className="mt-4">
                {previewUrl && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">New Profile Picture Preview:</p>
                    <img src={previewUrl} alt="Preview" className="w-20 h-20 rounded-full object-cover border" />
                  </div>
                )}
                <button
                  onClick={handleProfilePicUpload}
                  disabled={isLoading || !profilePicFile}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Uploading...' : 'Confirm Upload'}
                </button>
                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
              </div>
            )}
          </div>
          
          {loggedInUserId !== userId && (
            <div className="mt-4 md:mt-0 md:ml-auto">
              <button
                onClick={isFollowing ? handleUnfollow : handleFollow}
                disabled={isLoading}
                className={`px-6 py-3 rounded-full font-medium ${isFollowing 
                  ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'} transition-colors disabled:opacity-50 flex items-center`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isFollowing ? 'Unfollowing...' : 'Following...'}
                  </>
                ) : isFollowing ? 'Following' : 'Follow'}
              </button>
            </div>
          )}
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex justify-around">
            <div className="text-center px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-default">
              <div className="text-2xl font-bold text-gray-900">{profile.posts?.length || 0}</div>
              <div className="text-gray-600">Posts</div>
            </div>
            
            <button 
              onClick={handleFollowersClick}
              className="text-center px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-2xl font-bold text-gray-900">{profile.followers?.length || 0}</div>
              <div className="text-gray-600">Followers</div>
            </button>
            
            <button 
              onClick={handleFollowingClick}
              className="text-center px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-2xl font-bold text-gray-900">{profile.following?.length || 0}</div>
              <div className="text-gray-600">Following</div>
            </button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default ProfileHeader;