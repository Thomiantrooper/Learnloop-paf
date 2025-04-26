import React, { useState, useEffect } from "react";

function ProgressUpdateForm({ editingUpdate, onUpdate, setEditingUpdate, closeModal }) {
  const [type, setType] = useState("");
  const [inProgressType, setInProgressType] = useState("");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (editingUpdate) {
      setType(editingUpdate.type);
      setTitle(editingUpdate.title);
      setDate(editingUpdate.date ? new Date(editingUpdate.date).toISOString().split("T")[0] : "");
      setDescription(editingUpdate.description);
      if (editingUpdate.type === "In Progress") {
        setInProgressType(editingUpdate.inProgressType || "");
      }
    } else {
      setType("");
      setInProgressType("");
      setTitle("");
      setDate("");
      setDescription("");
    }
  }, [editingUpdate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let selectedDate = date ? new Date(date) : new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate > today) {
      alert("Please select a date that is today or earlier.");
      return;
    }

    const update = {
      type,
      inProgressType: type === "In Progress" ? inProgressType : null,
      title,
      date: selectedDate.toISOString(),
      description,
      userId: localStorage.getItem("userId"),
    };

    const url = editingUpdate
      ? `http://localhost:8080/api/progress-updates/${editingUpdate.id}`
      : "http://localhost:8080/api/progress-updates";
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

      if (!response.ok) throw new Error(`Error: ${response.status} ${response.statusText}`);
      await response.json();
      onUpdate();
      setEditingUpdate(null);
      closeModal();
    } catch (error) {
      console.error("Failed to submit update:", error);
    }
  };

  return (
    <div className="relative bg-white rounded-lg shadow-md p-6 w-full max-w-lg mx-auto">
      {/* Close Button */}
      <button
        onClick={closeModal}
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition-colors duration-200 focus:outline-none"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Form Header */}
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        {editingUpdate ? "Edit Progress Update" : "Add Progress Update"}
      </h2>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Type Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setInProgressType("");
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            required
          >
            <option value="">Select Type</option>
            <option value="Completed Tutorial">Completed Tutorial</option>
            <option value="New Skill Learned">New Skill Learned</option>
            <option value="In Progress">In Progress</option>
          </select>
        </div>

        {/* In Progress Sub-Type Dropdown */}
        {type === "In Progress" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Progress Type</label>
            <select
              value={inProgressType}
              onChange={(e) => setInProgressType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              required
            >
              <option value="">Select Progress Type</option>
              <option value="New Skill">New Skill</option>
              <option value="Tutorial">Tutorial</option>
            </select>
          </div>
        )}

        {/* Title Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            placeholder="Enter a title"
            required
          />
        </div>

        {/* Date Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={new Date().toISOString().split("T")[0]}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
          />
        </div>

        {/* Description Textarea */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-y"
            placeholder="Describe your progress"
            rows="4"
            required
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
          >
            {editingUpdate ? "Save Changes" : "Post Update"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProgressUpdateForm;