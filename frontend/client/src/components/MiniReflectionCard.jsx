import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

function MiniReflectionCard({ update }) {
  const [note, setNote] = useState(update.userReflection || "");

  return (
    <div className="bg-white border border-amber-200 rounded-lg p-5 shadow">
      <h3 className="font-bold text-amber-700 mb-2">🕓 In Progress: {update.title}</h3>
      <p className="text-sm text-gray-600 mb-2">✨ You're doing great! Keep notes as you go.</p>
      <ReactQuill value={note} onChange={setNote} className="mt-2" />
    </div>
  );
}

export default MiniReflectionCard;
