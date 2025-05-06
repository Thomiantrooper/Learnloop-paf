import React, { useState, useEffect } from "react";
import axios from "axios";

const Suggestions = ({ loggedInUserId }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/profile/suggestions?currentUserId=${loggedInUserId}`
        );
        setSuggestions(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setError("Failed to load suggestions.");
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [loggedInUserId]);

  const handleFollow = async (userId) => {
    try {
      await axios.post(
        `http://localhost:8080/api/profile/${userId}/follow`,
        null,
        { params: { followerId: loggedInUserId } }
      );
      setSuggestions(suggestions.filter((user) => user.id !== userId));
    } catch (err) {
      console.error("Error following user:", err);
    }
  };

  const displayedSuggestions = showAll ? suggestions : suggestions.slice(0, 5);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded-md animate-pulse w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center py-4">{error}</div>;
  }

  return (
    <div>
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
          <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
        </svg>
        Suggestions For You
      </h3>

      <div className="space-y-4">
        {displayedSuggestions.length > 0 ? (
          displayedSuggestions.map((user) => (
            <div key={user.id} className="flex items-center justify-between group">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow">
                    <img
                      src={user.profilePicture || `https://i.pravatar.cc/150?u=${user.username}`}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-green-400 rounded-full p-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 group-hover:text-indigo-600 transition-colors">{user.name}</h4>
                  <p className="text-xs text-gray-500">@{user.username}</p>
                </div>
              </div>
              <button
                onClick={() => handleFollow(user.id)}
                className="text-xs font-medium px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
              >
                Follow
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            <p className="text-gray-500">No suggestions available</p>
          </div>
        )}
      </div>

      {suggestions.length > 5 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-6 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          {showAll ? (
            <span className="flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Show Less
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Show More
            </span>
          )}
        </button>
      )}
    </div>
  );
};

export default Suggestions;