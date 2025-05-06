import React from "react";
import axios from "axios";
import { X, User, Check } from "react-feather";

const FollowingModal = ({ followingUsers, onClose, loggedInUserId, setProfile, fetchFollowing }) => {
  const [isUnfollowing, setIsUnfollowing] = React.useState(null);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [localFollowing, setLocalFollowing] = React.useState(followingUsers);

  const handleUnfollow = async (userIdToUnfollow) => {
    setIsUnfollowing(userIdToUnfollow);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:8080/api/profile/${userIdToUnfollow}/unfollow`,
        null,
        {
          params: { followerId: loggedInUserId },
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        }
      );
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      
      // Option 1: Filter out the unfollowed user locally
      setLocalFollowing(prev => prev.filter(user => user.id !== userIdToUnfollow));
      
      // Option 2: Or refresh the entire list from parent
      if (fetchFollowing) {
        await fetchFollowing();
      }
      
      // Update profile data
      const updatedProfile = await axios.get(
        `http://localhost:8080/api/profile/public/${loggedInUserId}`
      );
      setProfile(updatedProfile.data);
      
    } catch (err) {
      console.error("Error unfollowing user:", err);
      alert("Failed to unfollow user.");
    } finally {
      setIsUnfollowing(null);
    }
  };

  // Update local state when parent's followingUsers changes
  React.useEffect(() => {
    setLocalFollowing(followingUsers);
  }, [followingUsers]);

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800">Following</h2>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Following List */}
        <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
          {localFollowing.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <User className="mx-auto mb-2" size={48} />
              <p>You're not following anyone yet</p>
            </div>
          ) : (
            localFollowing.map((user) => (
              <div key={user.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {/* Profile Picture */}
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm">
                        <img
                          src={user.profilePicturePath || `https://i.pravatar.cc/150?u=${user.username}`}
                          alt={user.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = `https://i.pravatar.cc/150?u=${user.username}`;
                          }}
                        />
                      </div>
                      {showSuccess && isUnfollowing === user.id && (
                        <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 shadow-sm">
                          <Check size={14} className="text-white" />
                        </div>
                      )}
                    </div>

                    {/* Name and Username */}
                    <div className="min-w-0">
                      <h4 className="font-semibold text-gray-800 truncate">{user.name}</h4>
                      <p className="text-sm text-gray-500 truncate">@{user.username}</p>
                    </div>
                  </div>

                  {/* Unfollow Button */}
                  <button
                    onClick={() => handleUnfollow(user.id)}
                    disabled={isUnfollowing === user.id}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      isUnfollowing === user.id
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-red-50 text-red-600 hover:bg-red-100"
                    }`}
                  >
                    {isUnfollowing === user.id ? "Unfollowing..." : "Unfollow"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default FollowingModal;