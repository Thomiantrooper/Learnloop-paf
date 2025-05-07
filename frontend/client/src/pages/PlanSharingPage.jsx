import React, { useState, useEffect } from "react";
import PlanSharingForm from "../components/PlanSharingForm";
import PlanSharingList from "../components/PlanSharingList";
import PlanSharingSidebar from "../components/PlanSharingSidebar";
import { FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AIChatModal from "../components/AIChatModal";

function PlanSharingPage() {
  const [updates, setUpdates] = useState([]);
  const [editingUpdate, setEditingUpdate] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);

  useEffect(() => {
    fetchUpdates();
  }, []);

  const fetchUpdates = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/plan-sharing/user/${localStorage.getItem("userId")}`
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

  const updateFavoriteStatus = async (id, isFavorite) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8080/api/plan-sharing/${id}/favorite?isFavorite=${isFavorite}`, 
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );
  
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
  
      const data = await response.json();
      // Update the local state immediately for better UX
      setUpdates(updates.map(update => 
        update.id === id ? { ...update, isFavorite: isFavorite === 1 } : update
      ));
      toast.success(isFavorite === 1 ? "Added to favorites!" : "Removed from favorites!");
    } catch (error) {
      console.error("Failed to update favorite status:", error);
      toast.error("Failed to update favorite status");
      // Revert the UI if the request fails
      setUpdates(updates.map(update => 
        update.id === id ? { ...update, isFavorite: !update.isFavorite } : update
      ));
    }
  };

  const handleEdit = (update) => {
    setEditingUpdate(update);
    setShowFormModal(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:8080/api/plan-sharing/${id}`, {
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

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-purple-50 flex">
      {/* PlanSharingSidebar */}
      <PlanSharingSidebar updates={updates} />

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold text-gray-800">Learning Plan</h1>
          </div>

          {/* Floating + Button (Top-Right) */}
{/* Floating + Button (Bottom-Right & Blue) */}
<button
  onClick={() => {
    setEditingUpdate(null);
    setShowFormModal(true);
  }}
  className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-3xl flex items-center justify-center shadow-lg transition-all duration-300"
  title="Create New Plan"
>
  <FaPlus />
</button>



          {/* Form Modal */}
          {showFormModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-2xl">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  {editingUpdate ? "Edit Update" : "Add Update"}
                </h2>
                <PlanSharingForm
                  editingUpdate={editingUpdate}
                  onUpdate={fetchUpdates}
                  setEditingUpdate={setEditingUpdate}
                  closeModal={() => setShowFormModal(false)}
                />
              </div>
            </div>
          )}

          {/* List of Updates */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Your Sharings</h2>
            {updates.length > 0 ? (
              <PlanSharingList
                updates={updates}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleFavorite={updateFavoriteStatus}
              />
            ) : (
              <p className="text-center text-gray-600">No updates available yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlanSharingPage;