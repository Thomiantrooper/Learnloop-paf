import React, { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa";

function PlanSharingForm({ editingUpdate, onUpdate, setEditingUpdate, closeModal }) {
  const [title, setTitle] = useState("");
  const [topics, setTopics] = useState([]);
  const [description, setDescription] = useState("");
  const [resources, setResources] = useState([""]); // Start with one empty resource
  const [timelineStart, setTimelineStart] = useState("");
  const [timelineEnd, setTimelineEnd] = useState("");
  const [isFavorite, setIsFavorite] = useState(false); // Default to false

  useEffect(() => {
    if (editingUpdate) {
      setTitle(editingUpdate.title);
      setTopics(editingUpdate.topics || []);
      setDescription(editingUpdate.description);
      setResources(editingUpdate.resources?.length ? editingUpdate.resources : [""]);
      setTimelineStart(editingUpdate.timelineStart ? editingUpdate.timelineStart.substring(0, 10) : "");
      setTimelineEnd(editingUpdate.timelineEnd ? editingUpdate.timelineEnd.substring(0, 10) : "");
  
      setIsFavorite(editingUpdate.isFavorite || false);
    }
  }, [editingUpdate]);
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Filter out empty resources
    const filteredResources = resources.filter((resource) => resource.trim() !== "");

    const update = {
      title,
      topics: topics || [],
      description,
      resources: filteredResources, // Use filtered resources
      timelineStart: timelineStart ? new Date(timelineStart).toISOString() : null,
      timelineEnd: timelineEnd ? new Date(timelineEnd).toISOString() : null,
      isFavorite: isFavorite ? 1 : 0, // Send 1 or 0 instead of true/false
      userId: localStorage.getItem("userId"),
    };

    const url = editingUpdate
      ? `http://localhost:8080/api/plan-sharing/${editingUpdate.id}`
      : "http://localhost:8080/api/plan-sharing";
    const method = editingUpdate ? "PUT" : "POST";

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(update),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      onUpdate();
      setEditingUpdate(null);
      closeModal();
    } catch (error) {
      console.error("Failed to submit update:", error);
    }
  };

  // Add a new resource input field
  const addResourceField = () => {
    setResources([...resources, ""]);
  };

  // Handle changes in resource input fields
  const handleResourceChange = (index, value) => {
    const newResources = [...resources];
    newResources[index] = value;
    setResources(newResources);
  };

  return (
    <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-auto">
      {/* Close Icon */}
      <button
        onClick={closeModal}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors duration-200 focus:outline-none"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          />
        </div>

        {/* Topics Input */}
        {/* <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Topics</label>
          <input
            type="text"
            placeholder="Add topics (comma-separated)"
            value={topics.join(", ")}
            onChange={(e) => setTopics(e.target.value.split(", "))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          />
        </div> */}

        {/* Description Textarea */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            rows="4"
          />
        </div>

        {/* Resources Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Resources (URLs)</label>
          {resources.map((resource, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                placeholder="Enter a URL"
                value={resource}
                onChange={(e) => handleResourceChange(index, e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
              {index === resources.length - 1 && (
                <button
                  type="button"
                  onClick={addResourceField}
                  className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                >
                  <FaPlus className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Timeline Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Timeline</label>
          <div className="flex space-x-4">
            <input
              type="date"
              value={timelineStart}
              onChange={(e) => setTimelineStart(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
            <input
              type="date"
              value={timelineEnd}
              onChange={(e) => setTimelineEnd(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </div>
        </div>

        {/* Favorite Checkbox */}
        {/* <div className="flex items-center">
          <input
            type="checkbox"
            id="isFavorite"
            checked={isFavorite}
            onChange={(e) => setIsFavorite(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="isFavorite" className="ml-2 text-sm font-medium text-gray-700">
            Mark as Favorite
          </label>
        </div> */}

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
        >
          {editingUpdate ? "Update" : "Post Update"}
        </button>
      </form>
    </div>
  );
}

export default PlanSharingForm;
