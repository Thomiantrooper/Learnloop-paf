// src/components/PostForm.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const PostForm = ({ userId, onPostCreated }) => {
  const [description, setDescription] = useState("");
  const [media, setMedia] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const allowedImageTypes = ["image/png", "image/jpeg", "image/jpg"];
  const allowedVideoTypes = ["video/mp4", "video/quicktime"];
  const maxVideoSize = 10 * 1024 * 1024; // 10MB in bytes

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 3) {
      setError("Maximum 3 files allowed.");
      setMedia([]);
      return;
    }

    let validFiles = [];
    for (let file of files) {
      // Validate file type
      if (!allowedImageTypes.includes(file.type) && !allowedVideoTypes.includes(file.type)) {
        setError("Invalid file type. Allowed types: PNG, JPG, JPEG, MP4, MOV.");
        setMedia([]);
        return;
      }

      // Validate video size
      if (allowedVideoTypes.includes(file.type)) {
        if (file.size > maxVideoSize) {
          setError("Video file size must be less than 10MB.");
          setMedia([]);
          return;
        }

        // Validate video duration
        const video = document.createElement("video");
        video.preload = "metadata";
        video.onloadedmetadata = () => {
          if (video.duration > 30) {
            setError("Video must be 30 seconds or less.");
            setMedia([]);
          } else {
            validFiles.push(file);
            if (validFiles.length === files.length) {
              setMedia(validFiles);
              setError("");
            }
          }
        };
        video.onerror = () => {
          setError("Error reading video file.");
          setMedia([]);
        };
        video.src = URL.createObjectURL(file);
      } else {
        validFiles.push(file);
        if (validFiles.length === files.length) {
          setMedia(validFiles);
          setError("");
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("description", description);
    formData.append("userId", userId);
    media.forEach((file) => formData.append("media", file));

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const response = await axios.post("http://localhost:8080/api/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`,
        },
      });
      onPostCreated(response.data);
      setDescription("");
      setMedia([]);
    } catch (err) {
      if (err.response?.status === 403) {
        localStorage.removeItem("token");
        navigate("/error");
      } else {
        setError("Failed to create post: " + (err.response?.data || err.message));
        console.error("Error creating post:", err);
      }
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <form onSubmit={handleSubmit}>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="file"
          multiple
          accept="image/png,image/jpeg,image/jpg,video/mp4,video/quicktime"
          onChange={handleFileChange}
          className="mt-2"
        />
        {error && <p className="text-red-500">{error}</p>}
        <button
          type="submit"
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Post
        </button>
      </form>
    </div>
  );
};

export default PostForm;