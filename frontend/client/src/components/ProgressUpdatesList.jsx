import React, { useState } from "react";
import { FaEdit, FaTrash, FaCheckCircle, FaLightbulb, FaSpinner } from "react-icons/fa";
import SkillInsightCard from "./SkillInsightCard"; 

function ProgressUpdatesList({ updates, onEdit, onDelete }) {
  const [openInsightId, setOpenInsightId] = useState(null);

  const toggleInsight = (id) => {
    setOpenInsightId(openInsightId === id ? null : id);
  };

  const getIcon = (type) => {
    switch (type) {
      case "Completed Tutorial":
        return <FaCheckCircle className="text-blue-500" />;
      case "New Skill Learned":
        return <FaLightbulb className="text-emerald-500" />;
      case "In Progress":
        return <FaSpinner className="text-amber-500" />;
      default:
        return <FaLightbulb className="text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {updates.map((update) => (
        <div
          key={update.id}
          className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition"
        >
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                {getIcon(update.type)}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold text-gray-800 truncate">{update.title}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => toggleInsight(update.id)}
                    className="text-purple-500 hover:underline text-sm mt-1"
                  >
                    {openInsightId === update.id ? "Hide AI Insight" : "View AI Insight"}
                  </button>

                  <button
                    onClick={() => onEdit(update)}
                    className="text-gray-400 hover:text-blue-500 transition duration-300 p-1"
                    aria-label="Edit"
                  >
                    <FaEdit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDelete(update.id)}
                    className="text-gray-400 hover:text-red-500 transition duration-300 p-1"
                    aria-label="Delete"
                  >
                    <FaTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-gray-600 mt-2">{update.description}</p>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <span className={`px-2 py-1 rounded-full ${
                  update.type === "Completed Tutorial" ? "bg-blue-100 text-blue-800" :
                  update.type === "New Skill Learned" ? "bg-emerald-100 text-emerald-800" :
                  "bg-amber-100 text-amber-800"
                }`}>
                  {update.type}
                </span>

                <span className="text-gray-500">
                  {new Date(update.date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
              </div>

              {/* Conditionally Render SkillInsightCard */}
              {openInsightId === update.id && (
                <div className="mt-6">
                  <SkillInsightCard update={update} />
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ProgressUpdatesList;
