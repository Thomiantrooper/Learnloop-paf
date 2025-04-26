import React from "react";
import { FaArrowRight } from "react-icons/fa";

function PlanSharingSidebar({ updates }) {
  const favorites = updates.filter((update) => update.isFavorite);

  const scrollToContainer = (id) => {
    const container = document.getElementById(`plan-${id}`);
    if (container) {
      container.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="w-64 bg-white p-6 border-r border-gray-200">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Favorites</h2>
      <div className="space-y-4">
        {favorites.length > 0 ? (
          favorites.map((update) => (
            <div
              key={update.id}
              className="bg-green-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <h3 className="text-lg font-semibold text-gray-800">{update.title}</h3>
              <p className="text-gray-600 mt-2">{update.description}</p>
              <small className="text-gray-400 block mt-2">
                <strong>Timeline:</strong>{" "}
                {update.timelineStart ? new Date(update.timelineStart).toLocaleDateString() : "No start date"} -{" "}
                {update.timelineEnd ? new Date(update.timelineEnd).toLocaleDateString() : "No end date"}
              </small>
              <button
                onClick={() => scrollToContainer(update.id)}
                className="mt-2 text-blue-500 hover:text-blue-600 transition duration-300"
              >
                <FaArrowRight className="w-5 h-5" />
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-600">No favorites yet.</p>
        )}
      </div>
    </div>
  );
}

export default PlanSharingSidebar;