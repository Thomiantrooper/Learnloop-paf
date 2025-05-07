import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEye, FaEyeSlash, FaGoogle, FaBookOpen } from "react-icons/fa";
import { motion } from "framer-motion";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      const response = await axios.post("http://localhost:8080/api/auth/login", {
        username,
        password,
      });

      if (response.status === 200) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userId", response.data.userId);
        localStorage.setItem("username", "response.data.username"); 
        navigate("/dashboard");
      }
    } catch (err) {
      let errorMessage = "An error occurred. Please try again.";
      if (err.response) {
        errorMessage = err.response.data.message || "Invalid credentials";
      } else if (err.request) {
        errorMessage = "Server unavailable. Please try again later.";
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-gray-900 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-700"
      >
        <div className="flex justify-center mb-6">
          <div className="flex items-center space-x-2">
            <FaBookOpen className="text-indigo-400 text-3xl" />
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              LearnLoop
            </span>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-1 text-center">Continue Your Learning Journey</h2>
        <p className="text-gray-400 text-center mb-6">Connect with fellow learners</p>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-red-900/50 text-red-200 rounded-lg text-sm border border-red-700/50"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-1" htmlFor="username">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white placeholder-gray-400"
              placeholder="enter your username"
              required
            />
          </div>

          <div className="relative">
            <label className="block text-gray-300 text-sm font-medium mb-1" htmlFor="password">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white placeholder-gray-400 pr-12"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 bottom-3 text-gray-400 hover:text-indigo-400 transition"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-lg font-medium transition ${isLoading 
              ? 'bg-indigo-700 cursor-not-allowed' 
              : 'bg-indigo-600 hover:bg-indigo-500'} flex items-center justify-center`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </>
            ) : 'Sign In'}
          </button>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-700"></div>
          <span className="mx-4 text-gray-400 text-sm">OR</span>
          <div className="flex-grow border-t border-gray-700"></div>
        </div>

        <a
          href="http://localhost:8080/oauth2/authorization/google"
          className="flex items-center justify-center py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition text-white w-full"
        >
          <FaGoogle className="mr-2 text-red-400" />
          Continue with Google
        </a>

        <div className="mt-6 text-center text-sm text-gray-400">
          New to LearnLoop?{" "}
          <Link to="/register" className="text-indigo-400 hover:underline font-medium">
            Create account
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-700">
          <p className="text-xs text-gray-500 text-center">
            By continuing, you agree to our <a href="#" className="hover:underline">Terms</a> and{" "}
            <a href="#" className="hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;