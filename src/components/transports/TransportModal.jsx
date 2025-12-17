// src/components/transports/TransportModal.jsx
import React, { useState } from "react";
import { X, UploadCloud } from "lucide-react";
import Swal from "sweetalert2";

export function TransportModal({ transport, onSave, onClose }) {
  const [name, setName] = useState(transport?.user?.name || transport?.name || "");
  const [email, setEmail] = useState(transport?.user?.email || transport?.email || "");
  const [phone, setPhone] = useState(transport?.user?.phone || transport?.phone || "");
  const [password, setPassword] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(transport?.user?.image || null);

  const handleSubmit = (e) => {
    e.preventDefault();

    // For create mode, validate required fields
    if (!transport) {
      if (!name.trim() || !email.trim() || !phone.trim()) {
        Swal.fire({
          icon: "warning",
          title: "Missing fields",
          text: "Please fill all required fields (name, email, phone).",
        });
        return;
      }
    }

    const payload = {
      id: transport?.user_id || transport?.user?.id || transport?.id,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password: password.trim(),
      image: imageFile,
    };

    onSave?.(payload);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {transport ? "Edit Transport" : "Add New Transport"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {/* Profile Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Image
              </label>
              <div className="flex items-center gap-4">
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                  />
                )}
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                  <UploadCloud className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {imagePreview ? "Change Image" : "Upload Image"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name {!transport && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter transport provider name"
                required={!transport}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email {!transport && <span className="text-red-500">*</span>}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter email address"
                required={!transport}
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone {!transport && <span className="text-red-500">*</span>}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter phone number"
                required={!transport}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password {!transport && <span className="text-red-500">*</span>}
                {transport && <span className="text-xs text-gray-500 ml-1">(Leave blank to keep current)</span>}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={transport ? "Leave blank to keep current" : "Enter password"}
                required={!transport}
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-[#FF8C00] rounded-lg hover:bg-[#e57c00] transition-colors"
          >
            {transport ? "Update Transport" : "Create Transport"}
          </button>
        </div>
      </div>
    </div>
  );
}

