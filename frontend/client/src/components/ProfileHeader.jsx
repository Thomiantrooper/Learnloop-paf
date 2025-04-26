import React, { useState } from "react";
import axios from "axios";
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
    setError("");
  };

  const handleProfilePicUpload = async () => {
    if (!profilePicFile) return;
    const formData = new FormData();
    formData.append("file", profilePicFile);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:8080/api/profile/${userId}/upload-profile-picture`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${token}`,
          },
        }
      );
      console.log("Upload response:", response.data);
      const updatedProfile = await axios.get(`http://localhost:8080/api/profile/public/${userId}`);
      setProfile(updatedProfile.data);
      setProfilePicFile(null);
      setError("");
    } catch (err) {
      setError("Error uploading profile picture: " + (err.response?.data || err.message));
      console.error("Error uploading profile picture:", err);
    }
  };

  const handleProfileUpdate = async () => {
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
    }
  };

  const handleDeleteBio = async () => {
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

  // const handleFollowingClick = async () => {
  //   try {
  //     const token = localStorage.getItem("token");
  //     const response = await axios.get(`http://localhost:8080/api/profile/following`, {
  //       params: { ids: profile.following },
  //       headers: {
  //         "Authorization": `Bearer ${token}`,
  //       },
  //     });
  //     setFollowingUsers(response.data);
  //     setShowFollowingModal(true);
  //   } catch (err) {
  //     setError("Error fetching following users: " + (err.response?.data || err.message));
  //     console.error("Error fetching following users:", err);
  //   }
  // };

  const handleFollowingClick = async () => {
    try {
      const token = localStorage.getItem("token");
      // Convert array to comma-separated string
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

  const profilePicUrl = profile?.profilePicturePath || defaultProfilePic;

  return (
    <header className="bg-white p-6 rounded-lg shadow-md mx-4 md:mx-8 mb-8">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-sky-400 p-1 relative">
          <img
            src={profilePicUrl}
            alt="Profile"
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error("Image failed to load:", e);
              e.target.src = defaultProfilePic;
            }}
            onLoad={() => console.log("Profile picture loaded successfully")}
          />
          {loggedInUserId === userId && (
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={handleProfilePicChange}
              className="absolute bottom-0 left-0 opacity-0 w-full h-full cursor-pointer"
            />
          )}
        </div>
        <div className="text-center md:text-left">
          {isEditingProfile ? (
            <div>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full p-2 mb-2 border rounded-md"
                placeholder="Enter new name"
              />
              <textarea
                value={newBio}
                onChange={(e) => setNewBio(e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder="Enter your bio"
                rows="3"
              />
              <div className="mt-2 flex space-x-2">
                <button
                  onClick={handleProfileUpdate}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                {profile.bio && (
                  <button
                    onClick={handleDeleteBio}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete Bio
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-semibold text-gray-800">{profile.name}</h1>
              <p className="text-gray-600 mt-2">{profile.bio || "No bio available"}</p>
              {loggedInUserId === userId && (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="mt-2 text-blue-600 hover:underline"
                >
                  Edit Profile
                </button>
              )}
            </>
          )}
          {loggedInUserId === userId && profilePicFile && (
            <button
              onClick={handleProfilePicUpload}
              className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Upload Profile Picture
            </button>
          )}
          {error && <p className="text-red-500 mt-2">{error}</p>}
          {loggedInUserId !== userId && (
            <button
              onClick={isFollowing ? handleUnfollow : handleFollow}
              disabled={isLoading}
              className={`mt-4 px-6 py-3 ${isFollowing ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"} text-white font-semibold rounded-full`}
            >
              {isLoading ? (isFollowing ? "Unfollowing..." : "Following...") : (isFollowing ? "Unfollow" : "Follow")}
            </button>
          )}
          {loggedInUserId === userId && (
            <button
              onClick={() => setShowPostForm(true)}
              className="mt-4 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl hover:bg-blue-700"
            >
              +
            </button>
          )}
          <div className="mt-4 flex justify-center space-x-8">
            <div className="text-center">
              <span className="font-bold text-lg">{profile.posts?.length || 0}  Posts </span>
              
            </div>
            <div className="text-center">
              {/* <span className="font-bold text-lg">{profile.followers?.length || 0}</span>
              <span className="text-gray-600 block">followers</span> */}
              <button onClick={handleFollowersClick} className="hover:underline font-bold text-lg">
                {profile.followers?.length || 0} Followers
              </button>
            </div>
            <div className="text-center">
              <button onClick={handleFollowingClick} className="hover:underline font-bold text-lg">
                {profile.following?.length || 0} Following
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ProfileHeader;