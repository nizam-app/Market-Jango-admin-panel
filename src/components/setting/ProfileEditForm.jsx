import React, { useEffect, useState } from "react";
import AvatarImage from "./AvatarImage";
import Swal from "sweetalert2";
import { updateUserProfile } from "../../api/userApi";
import { setAuthUser } from "../../utils/authUser";

const ProfileEditForm = ({ user, onUserUpdate }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);

  // initial load from user
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
      });
      setPreviewUrl(user.image || "");
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // avatar image change
  const handleImageChange = (file) => {
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      Swal.fire("Validation error", "Name is required.", "warning");
      return;
    }

    const payload = {
      name: form.name.trim(),
    };

    if (imageFile) {
      payload.image = imageFile; // 👈 backend expects "image"
    }

    try {
      setLoading(true);
      const res = await updateUserProfile(payload);

      const updatedUser = res.data?.data || null;

      if (updatedUser) {
        setAuthUser(updatedUser); // localStorage update
        if (onUserUpdate) onUserUpdate(updatedUser); // parent state update
        // যদি backend নতুন image URL দেয়, preview সেটা থেকেই আবার আসবে
        setPreviewUrl(updatedUser.image || previewUrl);
      }

      Swal.fire("Success", "Profile updated successfully.", "success");
      setImageFile(null);
    } catch (err) {
      console.error("Failed to update profile", err);
      const msg =
        err.response?.data?.message || "Failed to update profile.";
      Swal.fire("Error", msg, "error");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="text-sm text-gray-500">
        Profile information not available.
      </div>
    );
  }

  return (
    <form className="flex" onSubmit={handleSubmit}>
      {/* Profile Picture and form fields */}
      <div className="w-1/4">
        <AvatarImage
          imageUrl={previewUrl}
          editable
          onImageChange={handleImageChange}
        />
      </div>

      {/* Form Fields */}
      <div className="w-3/4 ">
        <div className="grid grid-cols-2 gap-x-12 gap-y-6">
          {/* name input field */}
          <div>
            <label
              htmlFor="name"
              className="block text-[#232323] font-normal mb-1"
            >
              Your Name
            </label>
            <input
              type="text"
              value={form.name}
              name="name"
              onChange={handleChange}
              className="w-full px-4 py-3 border border-[#DFEAF2] focus:outline-none rounded-[15px] text-[#337AB3] font-normal "
            />
          </div>

          {/* email input field (read-only) */}
          <div>
            <label
              htmlFor="email"
              className="block text-[#232323] font-normal mb-1"
            >
              Email
            </label>
            <input
              type="email"
              value={form.email}
              name="email"
              disabled
              className="w-full px-4 py-3 border border-[#DFEAF2] bg-gray-50 text-gray-500 rounded-[15px]"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="text-right mt-8">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#FF8C00] cursor-pointer font-medium py-3 px-15 rounded-[15px] disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default ProfileEditForm;
