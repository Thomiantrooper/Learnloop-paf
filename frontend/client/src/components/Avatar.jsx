import React from "react";

export const Avatar = ({ src, size = "md", className = "" }) => {
  const sizeClass = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  }[size];

  return (
    <img
      src={src}
      alt="avatar"
      className={`rounded-full object-cover ${sizeClass} ${className}`}
    />
  );
};
