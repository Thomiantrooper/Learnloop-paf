// src/pages/ErrorPage.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const ErrorPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract error details from navigation state
  const { status, message, details } = location.state || {
    status: "Unknown",
    message: "An unexpected error occurred.",
    details: "No additional details available."
  };

  const handleGoBack = () => {
    navigate(-1); // Go back to the previous page
  };

  const handleHome = () => {
    navigate("/dashboard"); // Adjust to your app’s home route
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Error {status}</h1>
        <p className="text-lg text-gray-800 mb-4">{message}</p>
        <p className="text-sm text-gray-600 mb-6">{details}</p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleGoBack}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          >
            Go Back
          </button>
          <button
            onClick={handleHome}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
          {(status === "401" || status === "403") && (
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Log Out
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;