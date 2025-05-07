import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaCheckCircle, FaLightbulb, FaSpinner, FaChevronDown, FaChevronUp, FaRobot } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import SkillInsightCard from "./SkillInsightCard";

function ProgressUpdatesList({ updates: initialUpdates, onEdit, onDelete }) {
  const [updates, setUpdates] = useState(initialUpdates);
  const [openInsightId, setOpenInsightId] = useState(null);
  const [loadingInsightId, setLoadingInsightId] = useState(null);

  useEffect(() => {
    setUpdates(initialUpdates);
  }, [initialUpdates]);

  const toggleInsight = (update) => {
    if (openInsightId === update.id) {
      setOpenInsightId(null);
    } else {
      setOpenInsightId(update.id);
      if (!update.aiInsight) {
        setLoadingInsightId(update.id);
      }
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "Completed Tutorial":
        return <FaCheckCircle className="text-blue-500 text-xl" />;
      case "New Skill Learned":
        return <FaLightbulb className="text-emerald-500 text-xl" />;
      case "In Progress":
        return <FaSpinner className="text-amber-500 text-xl animate-spin" />;
      default:
        return <FaLightbulb className="text-gray-500 text-xl" />;
    }
  };

  const handleInsightUpdate = (id, newInsight) => {
    const updated = updates.map((u) =>
      u.id === id ? { ...u, aiInsight: newInsight } : u
    );
    setUpdates(updated);
    setLoadingInsightId(null);
  };

  // Animation variants
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="space-y-4">
      {updates.map((update) => (
        <motion.div
          key={update.id}
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 hover:border-gray-200"
        >
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center shadow-inner">
                {getIcon(update.type)}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{update.title}</h3>
                  <p className="text-gray-600 mt-1">{update.description}</p>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEdit(update)}
                    className="text-gray-400 hover:text-blue-500 p-2 transition-colors duration-150 rounded-full hover:bg-blue-50"
                    aria-label="Edit"
                  >
                    <FaEdit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDelete(update.id)}
                    className="text-gray-400 hover:text-red-500 p-2 transition-colors duration-150 rounded-full hover:bg-red-50"
                    aria-label="Delete"
                  >
                    <FaTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                <span
                  className={`px-3 py-1 rounded-full ${
                    update.type === "Completed Tutorial"
                      ? "bg-blue-50 text-blue-700"
                      : update.type === "New Skill Learned"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  } font-medium`}
                >
                  {update.type}
                </span>

                <span className="text-gray-500">
                  {new Date(update.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>

              <div className="mt-4">
                <button
                  onClick={() => toggleInsight(update)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    openInsightId === update.id 
                      ? "bg-purple-50 text-purple-700" 
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  }`}
                  disabled={loadingInsightId === update.id}
                >
                  <FaRobot className="text-purple-500" />
                  <span>
                    {loadingInsightId === update.id
                      ? "Generating insight..."
                      : openInsightId === update.id
                      ? "Hide AI Insight"
                      : update.aiInsight
                      ? "View AI Insight"
                      : "Get AI Insight"}
                  </span>
                  {openInsightId === update.id ? (
                    <FaChevronUp className="ml-1 text-xs" />
                  ) : (
                    <FaChevronDown className="ml-1 text-xs" />
                  )}
                </button>
              </div>

              <AnimatePresence>
                {openInsightId === update.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4">
                      <SkillInsightCard
                        update={update}
                        onInsightGenerated={(newInsight) =>
                          handleInsightUpdate(update.id, newInsight)
                        }
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default ProgressUpdatesList;