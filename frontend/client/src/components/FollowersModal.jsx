// src/components/FollowersModal.jsx
import React from 'react';
import axios from 'axios';

const FollowersModal = ({ followers, onClose, loggedInUserId, setProfile }) => {
  const handleRemoveFollower = async (followerId) => {
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
      
      // Update UI
      onClose();
      const updatedProfile = await axios.get(
        `http://localhost:8080/api/profile/public/${loggedInUserId}`
      );
      setProfile(updatedProfile.data);
    } catch (err) {
      console.error('Error removing follower:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Followers</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900">
            &times;
          </button>
        </div>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {followers.map((user) => (
            <div key={user.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-sky-400 p-1">
                  <img
                    src={user.profilePicturePath || `https://i.pravatar.cc/150?u=${user.username}`}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">{user.name}</h4>
                  <p className="text-sm text-gray-600">@{user.username}</p>
                </div>
              </div>
              <button
                onClick={() => handleRemoveFollower(user.id)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default FollowersModal;