import React, { useState, useEffect } from "react";
import axios from "axios";

const Suggestions = ({ loggedInUserId }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState("");
  const [showAll, setShowAll] = useState(false); // State to toggle "See More"

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/profile/suggestions?currentUserId=${loggedInUserId}`
        );
        setSuggestions(response.data);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setError("Failed to load suggestions.");
      }
    };

    fetchSuggestions();
  }, [loggedInUserId]);

  const handleFollow = async (userId) => {
    try {
      console.log("Attempting to follow user:", userId); // Debugging
      const response = await axios.post(
        `http://localhost:8080/api/profile/${userId}/follow`,
        null,
        {
          params: { followerId: loggedInUserId },
        }
      );
      if (response.status === 200) {
        console.log("Followed successfully:", userId); // Debugging
        // Update the suggestions list by removing the followed user
        setSuggestions(suggestions.filter((user) => user.id !== userId));
        //alert("Followed successfully!");
      }
    } catch (err) {
      console.error("Error following user:", err);
      console.error("Response data:", err.response?.data); // Debugging
      console.error("Response status:", err.response?.status); // Debugging
      //alert("Failed to follow user.");
    }
  };

  // Limit the number of suggestions displayed
  const displayedSuggestions = showAll ? suggestions.slice(0, 8) : suggestions.slice(0, 4);

  if (error) {
    return <div className="text-red-500 text-center mt-8">{error}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 mt-4 w-full max-w-[20rem]">
      {/* Suggestions Header */}
      <h3 className="block antialiased tracking-normal font-sans text-2xl font-semibold leading-snug text-gray-900 mb-4">
        Suggestions for You
      </h3>

      {/* Suggestions List */}
      <div className="space-y-4">
        {displayedSuggestions.map((user) => (
          <div key={user.id} className="flex items-center justify-between">
            {/* User Info */}
            <div className="flex items-center space-x-4">
              {/* Profile Picture */}
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-sky-400 p-1">
                <img
                  src={user.profilePicture || `https://i.pravatar.cc/150?u=${user.username}`}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Name and Username */}
              <div>
                <h4 className="font-semibold text-gray-800">{user.name}</h4>
                <p className="text-sm text-gray-600">@{user.username}</p>
              </div>
            </div>

            {/* Follow Button */}
            <button
              onClick={() => handleFollow(user.id)}
              className="rounded-md border border-slate-300 py-2 px-4 text-center text-sm transition-all shadow-sm hover:shadow-lg text-slate-600 hover:text-white hover:bg-slate-800 hover:border-slate-800 focus:text-white focus:bg-slate-800 focus:border-slate-800 active:border-slate-800 active:text-white active:bg-slate-800 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
            >
              Follow
            </button>
          </div>
        ))}
      </div>

      {/* "See More" Button */}
      {suggestions.length > 4 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-300"
        >
          {showAll ? "See Less" : "See More"}
        </button>
      )}
    </div>
  );
};

export default Suggestions;