import React, { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const PostForm = ({ userId, onPostCreated }) => {
  const [description, setDescription] = useState("");
  const [mediaQueue, setMediaQueue] = useState([]);
  const [error, setError] = useState("");
  const [croppingImage, setCroppingImage] = useState(null);
  const [croppingSrc, setCroppingSrc] = useState("");
  const [trimmingVideo, setTrimmingVideo] = useState(null);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(30);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  const allowedImageTypes = ["image/png", "image/jpeg", "image/jpg"];
  const allowedVideoTypes = ["video/mp4", "video/quicktime"];
  const maxVideoSize = 10 * 1024 * 1024;

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
      if (allowedImageTypes.includes(file.type)) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const ratio = img.width / img.height;
            if (ratio >= 1) {
              setCroppingImage(file);
              setCroppingSrc(event.target.result);
            } else {
              setMediaQueue((prev) => [...prev, file]);
            }
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
      } else if (allowedVideoTypes.includes(file.type)) {
        if (file.size > maxVideoSize) {
          setError("Video must be ≤ 10MB.");
          return;
        }
        const url = URL.createObjectURL(file);
        const video = document.createElement("video");
        video.preload = "metadata";
        video.onloadedmetadata = () => {
          if (video.duration > 30) {
            setTrimmingVideo({ file, src: url, duration: Math.floor(video.duration) });
            setTrimStart(0);
            setTrimEnd(30);
          } else {
            setMediaQueue((prev) => [...prev, file]);
          }
        };
        video.src = url;
      } else {
        setError("Unsupported file type.");
      }
    }
  };

  const handleCropConfirm = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      const aspectRatio = img.width / img.height;
  
      // Enforce Instagram/LinkedIn rules
      if (aspectRatio > 1.91 || aspectRatio < 0.8) {
        setError("Image ratio must be between 4:5 and 1.91:1 (Instagram/LinkedIn standard)");
        return;
      }
  
      const cropSize = Math.min(img.width, img.height);
      const cropX = (img.width - cropSize) / 2;
      const cropY = (img.height - cropSize) / 2;
  
      canvas.width = 1080;
      canvas.height = 1080;
  
      ctx.drawImage(
        img,
        cropX,
        cropY,
        cropSize,
        cropSize,
        0,
        0,
        1080,
        1080
      );
  
      canvas.toBlob((blob) => {
        const croppedFile = new File([blob], croppingImage.name, { type: blob.type });
        setMediaQueue((prev) => [...prev, croppedFile]);
        setCroppingImage(null);
        setCroppingSrc("");
      }, croppingImage.type);
    };
    img.src = croppingSrc;
  };
  

  const handleTrimConfirm = () => {
    const trimmed = new File([trimmingVideo.file], trimmingVideo.file.name, {
      type: trimmingVideo.file.type,
    });
    trimmed.trimInfo = { start: trimStart, end: trimEnd };
    setMediaQueue((prev) => [...prev, trimmed]);
    setTrimmingVideo(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("description", description);
    formData.append("userId", userId);
    mediaQueue.forEach((file) => {
      formData.append("media", file);
      if (file.trimInfo) {
        formData.append("trimStart", file.trimInfo.start);
        formData.append("trimEnd", file.trimInfo.end);
      }
    });

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("http://localhost:8080/api/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      onPostCreated(res.data);
      setDescription("");
      setMediaQueue([]);
    } catch (err) {
      console.error("Upload failed:", err);
      setError("Upload failed. Please try again.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white shadow p-6 rounded-xl space-y-6">
      <h2 className="text-xl font-bold">Create a Post</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Write something..."
          className="w-full p-3 border rounded"
          required
        />
        <input
          type="file"
          accept="image/*,video/mp4,video/quicktime"
          multiple
          onChange={handleFileChange}
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        {mediaQueue.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {mediaQueue.map((file, i) => (
              <div key={i} className="border p-2 rounded shadow text-xs">
                <p>{file.name}</p>
              </div>
            ))}
          </div>
        )}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Post
        </button>
      </form>

      {croppingImage && (
        <div className="mt-6 border p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Crop Image</h3>
          <img src={croppingSrc} alt="Crop Preview" className="max-w-xs mx-auto mb-2" />
          <canvas ref={canvasRef} style={{ display: "none" }} />
          <button
            onClick={handleCropConfirm}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Crop & Add
          </button>
        </div>
      )}

      {trimmingVideo && (
        <div className="mt-6 border p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Trim Video</h3>
          <video src={trimmingVideo.src} controls className="w-full rounded mb-2" />
          <label className="text-sm font-medium">
            Trim from {trimStart}s to {trimEnd}s
          </label>
          <div className="flex gap-2 items-center mt-2">
            <input
              type="range"
              min={0}
              max={trimmingVideo.duration - 1}
              value={trimStart}
              onChange={(e) => setTrimStart(Number(e.target.value))}
            />
            <input
              type="range"
              min={trimStart + 1}
              max={trimmingVideo.duration}
              value={trimEnd}
              onChange={(e) => setTrimEnd(Number(e.target.value))}
            />
          </div>
          <button
            onClick={handleTrimConfirm}
            className="mt-3 bg-green-600 text-white px-4 py-2 rounded"
          >
            Trim & Add
          </button>
        </div>
      )}
    </div>
  );
};

export default PostForm;
