import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";

const LandingPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center relative" style={{ backgroundImage: 'url(/feedback-bg.jpg)' }}>
      <div className="w-full p-12 flex flex-col items-center justify-center text-center relative">
        {/* Text and Call-to-Action Section */}
        <div className="w-full text-center px-6 space-y-6">
          <motion.h1 
            className="text-6xl font-extrabold text-white mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Welcome to LearnLoop
          </motion.h1>
          
          <motion.p 
            className="text-xl text-white mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            A platform to share and learn skills like coding. Connect with experts, take interactive courses, and level up your skills today!
          </motion.p>
          
          <motion.div 
            className="flex justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            <Link
              to="/login"
              className="px-10 py-5 text-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-md shadow-md flex items-center justify-center space-x-3 hover:scale-105 transition-transform"
            >
              <span>Get Started</span>
              <FaArrowRight className="ml-1 text-sm" />
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;