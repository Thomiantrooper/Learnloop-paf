import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBookOpen, FaHome, FaChartLine, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { RiBook2Fill } from 'react-icons/ri';
import { motion } from 'framer-motion';

const Sidebar = ({ handleLogout }) => {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    handleLogout();
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  const navItems = [
    { path: "/dashboard", icon: <FaHome size={20} />, label: "Home" },
    { path: "/plan-sharing", icon: <RiBook2Fill size={20} />, label: "Learning Plan" },
    { path: "/progress-updates", icon: <FaChartLine size={20} />, label: "Learning Journey" },
    { path: `/profile/${localStorage.getItem('userId')}`, icon: <FaUser size={20} />, label: "Profile" }
  ];

  return (
    <motion.div 
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed left-0 top-0 h-screen w-64 bg-white shadow-lg z-10 flex flex-col border-r border-gray-100"
    >
      {/* Sidebar Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center">
          <FaBookOpen className="text-indigo-400 text-3xl mr-2" />
          <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            LearnLoop
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item, index) => (
          <motion.div
            key={item.path}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              to={item.path}
              className="flex items-center p-3 rounded-lg transition-all duration-200 hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 group"
            >
              <div className="flex-shrink-0 mr-3 text-gray-500 group-hover:text-indigo-600">
                {item.icon}
              </div>
              <span className="font-medium">{item.label}</span>
            </Link>
          </motion.div>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-100">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogoutClick}
          className="flex items-center w-full p-3 rounded-lg transition-all duration-200 hover:bg-red-50 text-gray-600 hover:text-red-600 group"
        >
          <div className="flex-shrink-0 mr-3 text-gray-500 group-hover:text-red-600">
            <FaSignOutAlt size={20} />
          </div>
          <span className="font-medium">Logout</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Sidebar;