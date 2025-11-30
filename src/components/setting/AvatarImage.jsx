// src/components/setting/AvatarImage.jsx
import React, { useRef } from "react";

const DEFAULT_AVATAR =
  "https://via.placeholder.com/120x120.png?text=User";

const AvatarImage = ({ imageUrl, editable = false, onImageChange }) => {
  const fileInputRef = useRef(null);

  const handleEditClick = () => {
    if (!editable) return;
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onImageChange) {
      onImageChange(file);
    }
  };

  return (
    <div className="relative w-[120px] h-[120px]">
      <img
        src={imageUrl || DEFAULT_AVATAR}
        alt="Profile"
        className="w-full h-full rounded-full object-cover border border-[#DFEAF2]"
      />

      {editable && (
        <>
          <button
            type="button"
            onClick={handleEditClick}
            className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-[#FF8C00]
                       flex items-center justify-center cursor-pointer shadow-md"
          >
            {/* pencil icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M4 20H5.41421C5.87678 20 6.10802 20 6.32599 19.9473C6.51721 19.9019 6.7003 19.8261 6.86745 19.7229C7.05615 19.6062 7.21747 19.4449 7.5401 19.1223L19 7.66241C20.1046 6.55786 20.1046 4.76164 19 3.65709C17.8954 2.55254 16.0992 2.55254 14.9946 3.65709L3.53476 15.1169C3.21213 15.4396 3.05081 15.6009 2.9341 15.7896C2.8309 15.9568 2.75508 16.1399 2.70966 16.3311C2.65698 16.5491 2.65698 16.7803 2.65698 17.2429V18.6571C2.65698 19.4002 3.25681 20 4 20Z"
                stroke="#ffffff"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </>
      )}
    </div>
  );
};

export default AvatarImage;
