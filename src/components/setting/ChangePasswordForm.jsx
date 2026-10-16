import React, { useState } from "react";
import Swal from "sweetalert2";
import { adminResetPassword } from "../../api/adminApi";
import { getAuthUser } from "../../utils/authUser";

const ChangePasswordForm = () => {
  const user = getAuthUser();
  const [form, setForm] = useState({
    old_password: "",
    password: "",
    password_confirmation: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.email) {
      Swal.fire("Error", "Email not found on profile.", "error");
      return;
    }
    if (form.password.length < 8) {
      Swal.fire("Validation", "New password must be at least 8 characters.", "warning");
      return;
    }
    if (form.password !== form.password_confirmation) {
      Swal.fire("Validation", "Password confirmation does not match.", "warning");
      return;
    }
    try {
      setLoading(true);
      await adminResetPassword({
        email: user.email,
        old_password: form.old_password,
        password: form.password,
      });
      Swal.fire("Success", "Password updated successfully.", "success");
      setForm({ old_password: "", password: "", password_confirmation: "" });
    } catch (err) {
      const msg = err.response?.data?.message || "Could not update password.";
      Swal.fire("Error", msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <div>
        <label className="block text-sm mb-1">Current password</label>
        <input
          type="password"
          className="w-full border rounded-lg px-3 py-2"
          value={form.old_password}
          onChange={(e) => setForm((f) => ({ ...f, old_password: e.target.value }))}
          required
          minLength={8}
        />
      </div>
      <div>
        <label className="block text-sm mb-1">New password</label>
        <input
          type="password"
          className="w-full border rounded-lg px-3 py-2"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          required
          minLength={8}
        />
      </div>
      <div>
        <label className="block text-sm mb-1">Confirm new password</label>
        <input
          type="password"
          className="w-full border rounded-lg px-3 py-2"
          value={form.password_confirmation}
          onChange={(e) => setForm((f) => ({ ...f, password_confirmation: e.target.value }))}
          required
          minLength={8}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="bg-[#FF8C00] text-white px-6 py-2 rounded-full disabled:opacity-50"
      >
        {loading ? "Saving…" : "Update password"}
      </button>
    </form>
  );
};

export default ChangePasswordForm;
