import { toast } from "react-toastify";

const toggleFavorite = async (id) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`http://localhost:8080/api/plan-sharing/${id}/favorite`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    fetchUpdates(); // Refresh the list after toggling
    toast.success(data.isFavorite ? "Added to favorites!" : "Removed from favorites!");
  } catch (error) {
    console.error("Failed to toggle favorite:", error);
    toast.error("Failed to toggle favorite");
  }
};