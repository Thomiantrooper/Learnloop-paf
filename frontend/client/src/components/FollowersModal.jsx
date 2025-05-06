import React from 'react';
import axios from 'axios';
import { X, User, Check } from 'react-feather';

const FollowersModal = ({ followers, onClose, loggedInUserId, setProfile }) => {
  const [isRemoving, setIsRemoving] = React.useState(null);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [localFollowers, setLocalFollowers] = React.useState(followers);

  const handleRemoveFollower = async (followerId) => {
    setIsRemoving(followerId);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:8080/api/profile/${loggedInUserId}/remove-follower`,
        null,
        {
          params: { followerId },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      // Show success feedback
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      
      // Update local followers list
      setLocalFollowers(prev => prev.filter(user => user.id !== followerId));
      
      // Update profile data
      const updatedProfile = await axios.get(
        `http://localhost:8080/api/profile/public/${loggedInUserId}`
      );
      setProfile(updatedProfile.data);
    } catch (err) {
      console.error('Error removing follower:', err);
      alert('Failed to remove follower');
    } finally {
      setIsRemoving(null);
    }
  };

  // Sync local state with props
  React.useEffect(() => {
    setLocalFollowers(followers);
  }, [followers]);

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800">Followers</h2>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Followers List */}
        <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
          {localFollowers.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <User className="mx-auto mb-2" size={48} />
              <p>You don't have any followers yet</p>
            </div>
          ) : (
            localFollowers.map((user) => (
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
                      {showSuccess && isRemoving === user.id && (
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

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveFollower(user.id)}
                    disabled={isRemoving === user.id}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      isRemoving === user.id
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-red-50 text-red-600 hover:bg-red-100"
                    }`}
                  >
                    {isRemoving === user.id ? "Removing..." : "Remove"}
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

export default FollowersModal;