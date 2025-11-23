// src/components/Modal.jsx
import React from "react";

const Modal = ({ message, onClose }) => {
  if (!message) return null; // If there's no message, don't render the modal

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-xs w-full">
        <h2 className="text-xl font-semibold">Success</h2>
        <p className="mt-4">{message}</p>
        <button
          onClick={onClose}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-full"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default Modal;
