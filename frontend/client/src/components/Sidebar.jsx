import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Sidebar = ({ handleLogout }) => {
  const navigate = useNavigate();

  // Handle logout click
  const handleLogoutClick = () => {
    handleLogout(); // Call the logout function passed from the parent component
    localStorage.removeItem('token'); // Remove token from local storage
    navigate('/login'); // Redirect to the login page
  };

  return (
    <div className="relative flex flex-col bg-white text-gray-700 rounded-xl shadow-lg p-6 w-full max-w-[20rem] h-full">
      {/* Sidebar Header */}
      <div className="mb-6 p-4 flex items-center justify-between">
        <h2 className="text-3xl font-semibold text-gray-900">LearnLoop</h2>
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-col gap-4">
        {/* Home */}
        <Link
          to="/dashboard"
          role="button"
          className="flex items-center px-4 py-3 rounded-lg hover:bg-blue-100 focus:bg-blue-200 transition duration-200"
        >
          <div className="flex-shrink-0 mr-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-6 w-6 text-gray-800"
            >
              <path
                fillRule="evenodd"
                d="M2.25 2.25a.75.75 0 000 1.5H3v10.5a3 3 0 003 3h1.21l-1.172 3.513a.75.75 0 001.424.474l.329-.987h8.418l.33.987a.75.75 0 001.422-.474l-1.17-3.513H18a3 3 0 003-3V3.75h.75a.75.75 0 000-1.5H2.25zm6.04 16.5l.5-1.5h6.42l.5 1.5H8.29zm7.46-12a.75.75 0 00-1.5 0v6a.75.75 0 001.5 0v-6zm-3 2.25a.75.75 0 00-1.5 0v3.75a.75.75 0 001.5 0V9zm-3 2.25a.75.75 0 00-1.5 0v1.5a.75.75 0 001.5 0v-1.5z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          Home
        </Link>

        {/* Learning Plan */}
        <Link
          to="/plan-sharing"
          role="button"
          className="flex items-center px-4 py-3 rounded-lg hover:bg-blue-100 focus:bg-blue-200 transition duration-200"
        >
          <div className="flex-shrink-0 mr-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-6 w-6 text-gray-800"
            >
              <path
                fillRule="evenodd"
                d="M7.5 6v.75H5.513c-.96 0-1.764.724-1.865 1.679l-1.263 12A1.875 1.875 0 004.25 22.5h15.5a1.875 1.875 0 001.865-2.071l-1.263-12a1.875 1.875 0 00-1.865-1.679H16.5V6a4.5 4.5 0 10-9 0zM12 3a3 3 0 00-3 3v.75h6V6a3 3 0 00-3-3zm-3 8.25a3 3 0 106 0v-.75a.75.75 0 011.5 0v.75a4.5 4.5 0 11-9 0v-.75a.75.75 0 011.5 0v.75z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          Learning Plan
        </Link>

        {/* Learning Progress Updates */}
        <Link
          to="/progress-updates"
          role="button"
          className="flex items-center px-4 py-3 rounded-lg hover:bg-blue-100 focus:bg-blue-200 transition duration-200"
        >
          <div className="flex-shrink-0 mr-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-6 w-6 text-gray-800"
            >
              <path
                fillRule="evenodd"
                d="M6.912 3a3 3 000-2.868 2.118l-2.411 7.838a3 3 0 00-.133.882V18a3 3 0 003 3h15a3 3 0 003-3v-4.162c0-.299-.045-.596-.133-.882l-2.412-7.838A3 3 0 0017.088 3H6.912zm13.823 9.75l-2.213-7.191A1.5 1.5 0 0017.088 4.5H6.912a1.5 1.5 0 00-1.434 1.059L3.265 12.75H6.11a3 3 0 012.684 1.658l.256.513a1.5 1.5 0 001.342.829h3.218a1.5 1.5 0 001.342-.83l.256-.512a3 3 0 012.684-1.658h2.844z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          Learning Journey
        </Link>

        {/* Profile */}
        <Link
          to={`/profile/${localStorage.getItem('userId')}`}
          role="button"
          className="flex items-center px-4 py-3 rounded-lg hover:bg-blue-100 focus:bg-blue-200 transition duration-200"
        >
          <div className="flex-shrink-0 mr-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-6 w-6 text-gray-800"
            >
              <path
                fillRule="evenodd"
                d="M12 2a7 7 0 00-7 7c0 3.87 3.13 7 7 7s7-3.13 7-7c0-3.87-3.13-7-7-7zm0 10.5c-1.755 0-3.5-.794-3.5-3.5s1.745-3.5 3.5-3.5 3.5.794 3.5 3.5-1.745 3.5-3.5 3.5zm0 1.5c2.482 0 7 1.244 7 3.5v2.5H5v-2.5c0-2.256 4.518-3.5 7-3.5z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          Profile
        </Link>

        {/* Logout */}
        <button
          onClick={handleLogoutClick}
          className="flex items-center px-4 py-3 rounded-lg hover:bg-red-100 focus:bg-red-200 transition duration-200 mt-6"
        >
          <div className="flex-shrink-0 mr-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-6 w-6 text-red-600"
            >
              <path
                fillRule="evenodd"
                d="M14.121 5.879a.75.75 0 011.06 1.061L9.687 12l5.495 5.061a.75.75 0 01-1.06 1.06L8.623 12l6.933-6.122a.75.75 0 010-1.061z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          Logout
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;
