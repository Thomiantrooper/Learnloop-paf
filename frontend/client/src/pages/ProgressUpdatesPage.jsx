import React, { useState, useEffect } from "react";
import ProgressUpdateForm from "../components/ProgressUpdateForm";
import ProgressUpdatesList from "../components/ProgressUpdatesList";
import ProgressGraph from "../components/ProgressGraph";
import ProgressSummary from "../components/ProgressSummary";
import { FaChartLine, FaPlus, FaSearch, FaFilter } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function ProgressUpdatesPage() {
  const navigate = useNavigate();
  const [updates, setUpdates] = useState([]);
  const [editingUpdate, setEditingUpdate] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showGraph, setShowGraph] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    fetchUpdates();
  }, []);

  const fetchUpdates = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/progress-updates/user/${localStorage.getItem("userId")}`
      );
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      setUpdates(data);
    } catch (error) {
      console.error("Failed to fetch updates:", error);
    }
  };

  const handleEdit = (update) => {
    setEditingUpdate(update);
    setShowFormModal(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:8080/api/progress-updates/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      fetchUpdates();
    } catch (error) {
      console.error("Failed to delete update:", error);
    }
  };

  const filteredUpdates = updates.filter((update) => {
    const matchesSearch =
      update.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      update.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "all" || update.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8 relative">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
              My Learning Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Track and visualize your learning progress
            </p>
          </div>

          {/* <button
            onClick={() => setShowGraph(!showGraph)}
            className="hidden md:flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 rounded-xl hover:bg-gray-100 transition duration-300 shadow-sm border border-gray-200"
          >
            <FaChartLine className="w-4 h-4" />
            <span>View Analytics</span>
          </button> */}
        </div>

        {/* Progress Summary */}
        <ProgressSummary updates={updates} />

        {/* Filter and Search */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search updates by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <FaFilter className="text-gray-400 mr-2" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="Completed Tutorial">Completed</option>
                  <option value="New Skill Learned">New Skills</option>
                  <option value="In Progress">In Progress</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* List of Updates */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">
              My Progress Updates
            </h2>
            <span className="text-sm text-gray-500">
              Showing {filteredUpdates.length} of {updates.length} entries
            </span>
          </div>

          {filteredUpdates.length > 0 ? (
                <ProgressUpdatesList
                  updates={filteredUpdates}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ) : (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                No updates found
              </h3>
              <p className="mt-1 text-gray-500">
                {searchTerm || filterType !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Get started by adding your first progress update"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => {
          setEditingUpdate(null);
          setShowFormModal(true);
        }}
        className="fixed bottom-8 right-8 md:bottom-12 md:right-12 flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition duration-300 shadow-lg z-40"
        aria-label="Add new entry"
      >
        <FaPlus className="w-6 h-6" />
      </button>

      {/* Form Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <ProgressUpdateForm
            editingUpdate={editingUpdate}
            onUpdate={fetchUpdates}
            setEditingUpdate={setEditingUpdate}
            closeModal={() => setShowFormModal(false)}
          />
        </div>
      )}

      {/* Graph Modal */}
      {/* {showGraph && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Progress Analytics
              </h2>
              <button
                onClick={() => setShowGraph(false)}
                className="text-gray-400 hover:text-gray-600 transition duration-200"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>
            <ProgressGraph updates={updates} />
          </div>
        </div>
      )} */}
    </div>
  );
}

export default ProgressUpdatesPage;