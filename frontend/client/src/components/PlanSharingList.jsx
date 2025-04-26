import React, { useState } from "react";
import { FaEdit, FaTrash, FaEllipsisV, FaStar, FaSearch, FaExternalLinkAlt, FaRegClock, FaLink } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import AIChatModal from "./AIChatModal";

function PlanSharingList({ updates, onEdit, onDelete, onToggleFavorite }) {
  const [dropdownOpenId, setDropdownOpenId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [selectedUpdate, setSelectedUpdate] = useState(null);
  const [filterOption, setFilterOption] = useState("none");
  const [activeTab, setActiveTab] = useState("all");

  // Premium color palette with gradients
  const stickyNoteColors = [
    "bg-gradient-to-br from-amber-50 to-amber-100 border-l-4 border-amber-300",
    "bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-300",
    "bg-gradient-to-br from-emerald-50 to-emerald-100 border-l-4 border-emerald-300",
    "bg-gradient-to-br from-rose-50 to-rose-100 border-l-4 border-rose-300",
    "bg-gradient-to-br from-violet-50 to-violet-100 border-l-4 border-violet-300",
    "bg-gradient-to-br from-indigo-50 to-indigo-100 border-l-4 border-indigo-300",
    "bg-gradient-to-br from-red-50 to-red-100 border-l-4 border-red-300",
    "bg-gradient-to-br from-teal-50 to-teal-100 border-l-4 border-teal-300",
    "bg-gradient-to-br from-orange-50 to-orange-100 border-l-4 border-orange-300",
    "bg-gradient-to-br from-slate-50 to-slate-100 border-l-4 border-slate-300",
  ];

  // Filter and sort updates
  const filteredAndSortedUpdates = updates
    .filter((update) => {
      if (activeTab === "favorites" && !update.isFavorite) return false;
      if (filterOption === "title" && searchQuery) {
        return update.title?.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    })
    .sort((a, b) => {
      if (filterOption === "date") {
        return new Date(b.timelineStart) - new Date(a.timelineStart);
      }
      return 0;
    });

  // Group updates by title if needed
  const groupedUpdates = filteredAndSortedUpdates.reduce((acc, update) => {
    if (filterOption === "title") {
      const title = update.title || "Untitled";
      if (!acc[title]) {
        acc[title] = [];
      }
      acc[title].push(update);
    }
    return acc;
  }, {});

  const handleToggleFavorite = async (id, isFavorite) => {
    await onToggleFavorite(id, isFavorite);
    setDropdownOpenId(null);
  };

  const handleAiSearch = (update) => {
    setSelectedUpdate(update);
    setIsAiModalOpen(true);
    setDropdownOpenId(null);
  };

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    },
    hover: {
      y: -5,
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Premium Header */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xs p-6 mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Knowledge Base</h1>
              <p className="text-gray-500 mt-1">Organize your learning resources and plans</p>
            </div>
            
            <div className="w-full md:w-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search plans..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-5 py-3 pl-12 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-gray-700 placeholder-gray-400"
                />
                <FaSearch className="absolute left-4 top-3.5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${activeTab === "all" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              All Plans
            </button>
            <button
              onClick={() => setActiveTab("favorites")}
              className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 ${activeTab === "favorites" ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              <FaStar className={activeTab === "favorites" ? "text-white" : "text-amber-400"} />
              Favorites
            </button>
            
            <div className="ml-auto">
              <select
                value={filterOption}
                onChange={(e) => setFilterOption(e.target.value)}
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-gray-700"
              >
                <option value="none">No Filter</option>
                <option value="date">Newest First</option>
                <option value="title">Group by Title</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-10">
          <AnimatePresence>
            {filterOption === "title" ? (
              Object.entries(groupedUpdates).map(([title, updatesInTitle]) => (
                <motion.div 
                  key={title}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <h2 className="text-xl md:text-2xl font-semibold text-gray-800 px-2 flex items-center gap-3">
                    <span className="w-1.5 h-6 md:h-8 bg-blue-600 rounded-full"></span>
                    {title}
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                    {updatesInTitle.map((update, index) => {
                      const colorClass = stickyNoteColors[index % stickyNoteColors.length];
                      return (
                        <motion.div
                          key={update.id}
                          variants={cardVariants}
                          initial="hidden"
                          animate="visible"
                          whileHover="hover"
                          className={`${colorClass} p-5 md:p-6 rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full relative`}
                        >
                          {/* Three dots menu - Top right */}
                          <div className="absolute top-3 right-3 z-20">
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDropdownOpenId(dropdownOpenId === update.id ? null : update.id);
                                }}
                                className="text-gray-400 hover:text-gray-600 transition duration-200 p-2 rounded-full hover:bg-gray-100"
                              >
                                <FaEllipsisV className="w-4 h-4" />
                              </button>
                              
                              <AnimatePresence>
                                {dropdownOpenId === update.id && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute right-0 mt-1 w-56 bg-white rounded-lg shadow-xl z-30 border border-gray-100 overflow-hidden"
                                  >
                                    {update.isFavorite ? (
                                      <button
                                        onClick={() => handleToggleFavorite(update.id, 0)}
                                        className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 text-sm flex items-center gap-3 transition-colors duration-200"
                                      >
                                        <FaStar className="text-amber-400" />
                                        Remove Favorite
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => handleToggleFavorite(update.id, 1)}
                                        className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 text-sm flex items-center gap-3 transition-colors duration-200"
                                      >
                                        <FaStar className="text-amber-400" />
                                        Add to Favorites
                                      </button>
                                    )}
                                    <button
                                      onClick={() => onEdit(update)}
                                      className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 text-sm flex items-center gap-3 transition-colors duration-200"
                                    >
                                      <FaEdit className="text-blue-400" />
                                      Edit Plan
                                    </button>
                                    <button
                                      onClick={() => handleAiSearch(update)}
                                      className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 text-sm flex items-center gap-3 transition-colors duration-200"
                                    >
                                      <FaSearch className="text-purple-400" />
                                      Enhance with AI
                                    </button>
                                    <button
                                      onClick={() => onDelete(update.id)}
                                      className="w-full px-4 py-3 text-left text-red-500 hover:bg-red-50 text-sm flex items-center gap-3 transition-colors duration-200"
                                    >
                                      <FaTrash />
                                      Delete
                                    </button>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>

                          {/* Favorite star - Bottom right */}
                          {update.isFavorite && (
                            <div className="absolute bottom-3 right-3 text-amber-400">
                              <FaStar className="w-5 h-5" />
                            </div>
                          )}

                          {/* Card content */}
                          <div className="flex-grow">
                            <p className="text-gray-700 text-base break-words whitespace-pre-wrap max-h-40 overflow-y-auto pr-2">
                              {update.description}
                            </p>
                          </div>

                          {/* Resources section */}
                          {update.resources && update.resources.length > 0 && (
                            <div className="mt-6 pt-4 border-t border-gray-200">
                              <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-2">
                                <FaLink className="text-gray-400" />
                                RESOURCES
                              </div>
                              <div className="space-y-2">
                                {update.resources.map((resource, idx) => (
                                  <a
                                    key={idx}
                                    href={resource.startsWith("http") ? resource : `https://${resource}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-2 transition-colors duration-200"
                                  >
                                    <FaExternalLinkAlt className="text-xs opacity-70" />
                                    <span className="truncate">{resource}</span>
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Timeline section */}
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-2">
                              <FaRegClock className="text-gray-400" />
                              TIMELINE
                            </div>
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                {update.timelineStart ? new Date(update.timelineStart).toLocaleDateString() : "No start"}
                              </span>
                              <span className="text-gray-400">→</span>
                              <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                                {update.timelineEnd ? new Date(update.timelineEnd).toLocaleDateString() : "No end"}
                              </span>
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {filteredAndSortedUpdates.map((update, index) => {
                  const colorClass = stickyNoteColors[index % stickyNoteColors.length];
                  return (
                    <motion.div
                      key={update.id}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover="hover"
                      className={`${colorClass} p-5 md:p-6 rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full relative`}
                    >
                      {/* Three dots menu - Top right */}
                      <div className="absolute top-3 right-3 z-20">
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDropdownOpenId(dropdownOpenId === update.id ? null : update.id);
                            }}
                            className="text-gray-400 hover:text-gray-600 transition duration-200 p-2 rounded-full hover:bg-gray-100"
                          >
                            <FaEllipsisV className="w-4 h-4" />
                          </button>
                          
                          <AnimatePresence>
                            {dropdownOpenId === update.id && (
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute right-0 mt-1 w-56 bg-white rounded-lg shadow-xl z-30 border border-gray-100 overflow-hidden"
                              >
                                {update.isFavorite ? (
                                  <button
                                    onClick={() => handleToggleFavorite(update.id, 0)}
                                    className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 text-sm flex items-center gap-3 transition-colors duration-200"
                                  >
                                    <FaStar className="text-amber-400" />
                                    Remove Favorite
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleToggleFavorite(update.id, 1)}
                                    className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 text-sm flex items-center gap-3 transition-colors duration-200"
                                  >
                                    <FaStar className="text-amber-400" />
                                    Add to Favorites
                                  </button>
                                )}
                                <button
                                  onClick={() => onEdit(update)}
                                  className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 text-sm flex items-center gap-3 transition-colors duration-200"
                                >
                                  <FaEdit className="text-blue-400" />
                                  Edit Plan
                                </button>
                                <button
                                  onClick={() => handleAiSearch(update)}
                                  className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 text-sm flex items-center gap-3 transition-colors duration-200"
                                >
                                  <FaSearch className="text-purple-400" />
                                  Enhance with AI
                                </button>
                                <button
                                  onClick={() => onDelete(update.id)}
                                  className="w-full px-4 py-3 text-left text-red-500 hover:bg-red-50 text-sm flex items-center gap-3 transition-colors duration-200"
                                >
                                  <FaTrash />
                                  Delete
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* Favorite star - Bottom right */}
                      {update.isFavorite && (
                        <div className="absolute bottom-3 right-3 text-amber-400">
                          <FaStar className="w-5 h-5" />
                        </div>
                      )}

                      {/* Card content */}
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">{update.title || "Untitled Plan"}</h3>
                        <p className="text-gray-600 text-base break-words whitespace-pre-wrap max-h-40 overflow-y-auto">
                          {update.description}
                        </p>
                      </div>

                      {/* Resources section */}
                      {update.resources && update.resources.length > 0 && (
                        <div className="mt-auto pt-4 border-t border-gray-200">
                          <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-2">
                            <FaLink className="text-gray-400" />
                            RESOURCES
                          </div>
                          <div className="space-y-2">
                            {update.resources.map((resource, idx) => (
                              <a
                                key={idx}
                                href={resource.startsWith("http") ? resource : `https://${resource}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-2 transition-colors duration-200"
                              >
                                <FaExternalLinkAlt className="text-xs opacity-70" />
                                <span className="truncate">{resource}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Timeline section */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-2">
                          <FaRegClock className="text-gray-400" />
                          TIMELINE
                        </div>
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {update.timelineStart ? new Date(update.timelineStart).toLocaleDateString() : "No start"}
                          </span>
                          <span className="text-gray-400">→</span>
                          <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                            {update.timelineEnd ? new Date(update.timelineEnd).toLocaleDateString() : "No end"}
                          </span>
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty state */}
          {filteredAndSortedUpdates.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl shadow-xs p-8 md:p-12 text-center border border-gray-100"
            >
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 md:w-20 md:h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4 md:mb-6">
                  <FaSearch className="text-gray-400 text-2xl md:text-3xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {searchQuery ? "No results found" : "No plans available"}
                </h3>
                <p className="text-gray-500">
                  {searchQuery 
                    ? "Try adjusting your search query"
                    : activeTab === "favorites" 
                      ? "You don't have any favorite plans yet"
                      : "Create your first plan to get started"}
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* AI Chatbot Modal */}
      {isAiModalOpen && (
        <AIChatModal
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          initialQuery={`Title: ${selectedUpdate?.title}\nDescription: ${selectedUpdate?.description}`}
        />
      )}
    </div>
  );
}

export default PlanSharingList;