import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiCrop, FiScissors, FiUpload, FiImage, FiVideo } from "react-icons/fi";

const PostForm = ({ userId, onPostCreated, onClose, isLarge = false }) => {
  const [description, setDescription] = useState("");
  const [mediaQueue, setMediaQueue] = useState([]);
  const [error, setError] = useState("");
  const [croppingImage, setCroppingImage] = useState(null);
  const [croppingSrc, setCroppingSrc] = useState("");
  const [trimmingVideo, setTrimmingVideo] = useState(null);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("post");
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  const allowedImageTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
  const allowedVideoTypes = ["video/mp4", "video/quicktime"];
  const maxVideoSize = 50 * 1024 * 1024; // 50MB
  const maxImageSize = 10 * 1024 * 1024; // 10MB

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + mediaQueue.length > 10) {
      setError("You can upload a maximum of 10 files");
      return;
    }

    for (const file of files) {
      if (allowedImageTypes.includes(file.type)) {
        if (file.size > maxImageSize) {
          setError("Image must be ≤ 10MB");
          continue;
        }
        processImageFile(file);
      } else if (allowedVideoTypes.includes(file.type)) {
        if (file.size > maxVideoSize) {
          setError("Video must be ≤ 50MB");
          continue;
        }
        processVideoFile(file);
      } else {
        setError("Unsupported file type. Please upload images (JPEG, PNG, WEBP) or videos (MP4)");
      }
    }
  };

  const processImageFile = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const ratio = img.width / img.height;
        if (ratio < 0.8 || ratio > 1.91) {
          setCroppingImage(file);
          setCroppingSrc(event.target.result);
        } else {
          setMediaQueue((prev) => [...prev, { file, type: "image" }]);
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const processVideoFile = (file) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      if (video.duration > 30) {
        setTrimmingVideo({ 
          file, 
          src: url, 
          duration: Math.floor(video.duration),
          originalDuration: video.duration
        });
        setTrimStart(0);
        setTrimEnd(Math.min(30, video.duration));
      } else {
        setMediaQueue((prev) => [...prev, { file, type: "video", duration: video.duration }]);
      }
    };
    video.src = url;
  };

  const handleCropConfirm = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      const aspectRatio = img.width / img.height;
      
      if (aspectRatio > 1.91 || aspectRatio < 0.8) {
        setError("Image ratio must be between 4:5 (0.8) and 1.91:1");
        return;
      }

      let width, height;
      if (aspectRatio >= 1) {
        width = Math.min(img.width, img.height * 1.91);
        height = width / aspectRatio;
      } else {
        height = Math.min(img.height, img.width / 0.8);
        width = height * aspectRatio;
      }

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(
        img,
        0,
        0,
        img.width,
        img.height,
        0,
        0,
        width,
        height
      );

      canvas.toBlob((blob) => {
        const croppedFile = new File([blob], croppingImage.name, { type: blob.type });
        setMediaQueue((prev) => [...prev, { file: croppedFile, type: "image" }]);
        setCroppingImage(null);
        setCroppingSrc("");
        setError("");
      }, croppingImage.type, 0.92);
    };
    img.src = croppingSrc;
  };

  const handleTrimConfirm = () => {
    const trimmed = new File([trimmingVideo.file], trimmingVideo.file.name, {
      type: trimmingVideo.file.type,
    });
    trimmed.trimInfo = { start: trimStart, end: trimEnd };
    setMediaQueue((prev) => [...prev, { 
      file: trimmed, 
      type: "video", 
      duration: trimEnd - trimStart 
    }]);
    setTrimmingVideo(null);
    setError("");
  };

  const removeMedia = (index) => {
    setMediaQueue(prev => prev.filter((_, i) => i !== index));
  };

 // In PostForm component, update the handleSubmit function:
 const handleSubmit = async (e) => {
  e.preventDefault();
  console.log('Form submitted');

  if (!description.trim() && mediaQueue.length === 0) {
    setError("Please add text or media to your post");
    return;
  }

  setIsSubmitting(true);
  setError("");

  const formData = new FormData();
  formData.append("description", description);
  formData.append("userId", userId);

  for (let i = 0; i < mediaQueue.length; i++) {
    const item = mediaQueue[i];
    formData.append("media", item.file);

    if (item.type === "video" && item.file.trimInfo) {
      formData.append("trimStart", item.file.trimInfo.start);
      formData.append("trimEnd", item.file.trimInfo.end);
    }
  }

  try {
    const token = localStorage.getItem("token");
    
    // Temporarily disconnect WebSocket during the post creation
    if (window.stompClient && window.stompClient.connected) {
      window.stompClient.disconnect();
    }

    const res = await axios.post("http://localhost:8080/api/posts", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });

    // Reconnect WebSocket after successful post
    if (window.connectWebSocket && userId) {
      window.connectWebSocket(userId, /* your callback function */);
    }

    onPostCreated(res.data);
    setDescription("");
    setMediaQueue([]);
    if (onClose) onClose();
  } catch (err) {
    console.error("Upload failed:", err);
    setError(err.response?.data?.message || "Upload failed. Please try again.");
  } finally {
    setIsSubmitting(false);
  }
};
  

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className={`bg-white rounded-xl shadow-xl overflow-hidden ${
      isLarge ? "w-full max-w-3xl" : "w-full max-w-md"
    }`}>
      <div className={`border-b border-gray-200 ${
        isLarge ? "p-6" : "p-4"
      } flex justify-between items-center`}>
        <h3 className={`${
          isLarge ? "text-xl" : "text-lg"
        } font-semibold text-gray-800`}>Create Post</h3>
        <button 
          onClick={onClose || (() => {
            setDescription("");
            setMediaQueue([]);
          })}
          className="text-gray-500 hover:text-gray-700"
        >
          <FiX size={20} />
        </button>
      </div>

      <div className="flex border-b border-gray-200">
        <button
          className={`flex-1 py-3 font-medium ${activeTab === "post" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"}`}
          onClick={() => setActiveTab("post")}
        >
          Post
        </button>
        <button
          className={`flex-1 py-3 font-medium ${activeTab === "story" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"}`}
          onClick={() => setActiveTab("story")}
        >
          Story
        </button>
      </div>

      <form onSubmit={handleSubmit} className={isLarge ? "p-6" : "p-4"}>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={`What's on your mind?`}
          className={`w-full ${
            isLarge ? "p-4 min-h-[200px] text-lg" : "p-3 min-h-[120px]"
          } border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none`}
          rows={isLarge ? 6 : 4}
        />

        {mediaQueue.length > 0 && (
          <div className={`mt-4 grid ${
            isLarge ? "grid-cols-3 sm:grid-cols-4" : "grid-cols-2 sm:grid-cols-3"
          } gap-2`}>
            {mediaQueue.map((item, i) => (
              <div key={i} className="relative group rounded-lg overflow-hidden">
                {item.type === "image" ? (
                  <img 
                    src={URL.createObjectURL(item.file)} 
                    alt="Preview" 
                    className="w-full h-32 object-cover"
                  />
                ) : (
                  <div className="relative w-full h-32 bg-gray-200 flex items-center justify-center">
                    <video 
                      src={URL.createObjectURL(item.file)}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute bottom-1 left-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
                      {item.duration ? item.duration.toFixed(1) + "s" : ""}
                    </div>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeMedia(i)}
                  className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                >
                  <FiX size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="mt-3 p-2 bg-red-50 text-red-600 text-sm rounded">
            {error}
          </div>
        )}

        <div className={`mt-4 flex justify-between items-center border-t border-gray-200 ${
          isLarge ? "pt-6" : "pt-4"
        }`}>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={triggerFileInput}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full"
              title="Add photos/videos"
            >
              <FiImage size={20} />
            </button>
            <button
              type="button"
              onClick={triggerFileInput}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full"
              title="Add video"
            >
              <FiVideo size={20} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*,video/mp4,video/quicktime"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting || (!description.trim() && mediaQueue.length === 0)}
            className={`px-4 py-2 rounded-lg font-medium ${
              isSubmitting || (!description.trim() && mediaQueue.length === 0) 
                ? "bg-blue-300 cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-700"
            } text-white`}
          >
            {isSubmitting ? "Posting..." : "Post"}
          </button>
        </div>
      </form>

      <AnimatePresence>
        {croppingImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto"
            >
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-semibold flex items-center">
                  <FiCrop className="mr-2" /> Crop Image
                </h3>
                <button onClick={() => setCroppingImage(null)} className="text-gray-500 hover:text-gray-700">
                  <FiX size={20} />
                </button>
              </div>
              <div className="p-4">
                <div className="flex justify-center mb-4">
                  <img 
                    src={croppingSrc} 
                    alt="Crop Preview" 
                    className="max-h-[60vh] max-w-full object-contain"
                  />
                </div>
                <canvas ref={canvasRef} style={{ display: "none" }} />
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setCroppingImage(null)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCropConfirm}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <FiCrop className="mr-2" /> Crop & Add
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {trimmingVideo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto"
            >
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-semibold flex items-center">
                  <FiScissors className="mr-2" /> Trim Video
                </h3>
                <button onClick={() => setTrimmingVideo(null)} className="text-gray-500 hover:text-gray-700">
                  <FiX size={20} />
                </button>
              </div>
              <div className="p-4">
                <div className="mb-4 rounded-lg overflow-hidden">
                  <video 
                    src={trimmingVideo.src} 
                    controls 
                    className="w-full"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select segment ({trimEnd - trimStart}s of {trimmingVideo.originalDuration.toFixed(1)}s)
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <input
                        type="range"
                        min={0}
                        max={trimmingVideo.duration - 1}
                        value={trimStart}
                        onChange={(e) => setTrimStart(Number(e.target.value))}
                        className="w-full"
                      />
                      <div className="text-xs text-gray-500 mt-1">Start: {trimStart}s</div>
                    </div>
                    <div className="flex-1">
                      <input
                        type="range"
                        min={trimStart + 1}
                        max={trimmingVideo.duration}
                        value={trimEnd}
                        onChange={(e) => setTrimEnd(Number(e.target.value))}
                        className="w-full"
                      />
                      <div className="text-xs text-gray-500 mt-1">End: {trimEnd}s</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setTrimmingVideo(null)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleTrimConfirm}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <FiScissors className="mr-2" /> Trim & Add
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PostForm;