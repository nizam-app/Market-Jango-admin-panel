// src/pages/AdminResetPasswordPage.jsx
import React, { useState } from "react";
import Swal from "sweetalert2";
import { adminResetPassword } from "../api/adminApi";

const AdminResetPasswordPage = () => {
    const [form, setForm] = useState({
        email: "",
        old_password: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.email.trim() || !form.old_password || !form.password) {
            Swal.fire("Validation error", "All fields are required.", "warning");
            return;
        }

        try {
            setLoading(true);
            await adminResetPassword({
                email: form.email.trim(),
                old_password: form.old_password,
                old_password_confirmation: form.old_password, // ✅ add
                password: form.password,
                password_confirmation: form.password,
            });

            await Swal.fire(
                "Success",
                "Password has been updated successfully.",
                "success"
            );

            setForm({
                email: "",
                old_password: "",
                password: "",
            });
        } catch (error) {
            console.error("Failed to reset admin password", error);

            let errorMessage = "Failed to reset admin password.";

            const apiData = error.response?.data;

            if (apiData) {
                // ✅ 1) jodi data er vitore field-wise error thake (Validation Failed)
                console.log(apiData, "api data")
                if (apiData.data && typeof apiData.data === "object") {
                    const fieldErrors = apiData.data;

                    const allMessages = [];

                    // sob field er sob message collect korbo
                    Object.values(fieldErrors).forEach((arr) => {
                        if (Array.isArray(arr)) {
                            arr.forEach((msg) => {
                                allMessages.push(msg);
                            });
                        }
                    });

                    if (allMessages.length > 0) {
                        // ekadhik message thakle line break diye join
                        errorMessage = allMessages.join("<br/>");
                    }
                }
                // ✅ 2) jodi data null hoy, kintu message thake (e.g. "Invalid email or password")
                else if (apiData.message) {
                    errorMessage = apiData.message;
                }
            }

            Swal.fire({
                icon: "error",
                title: "Error",
                // text na, html use korbo jate <br/> line break hisebe kaj kore
                html: errorMessage,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F5F7FB]">
            <div className="bg-white rounded-[15px] shadow-sm border border-[#E6EEF6] px-8 py-10 w-full max-w-md">
                <h1 className="text-[22px] font-semibold text-[#003158] mb-6">
                    Admin Password Reset
                </h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-[#003158]"
                        >
                            Email address
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            className="w-full rounded-[10px] border border-[#8AB3D3] px-3 py-2 text-sm focus:outline-none"
                            placeholder="admin@example.com"
                            value={form.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-1">
                        <label
                            htmlFor="old_password"
                            className="block text-sm font-medium text-[#003158]"
                        >
                            Current password
                        </label>
                        <input
                            id="old_password"
                            name="old_password"
                            type="password"
                            className="w-full rounded-[10px] border border-[#8AB3D3] px-3 py-2 text-sm focus:outline-none"
                            value={form.old_password}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-1">
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-[#003158]"
                        >
                            New password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            className="w-full rounded-[10px] border border-[#8AB3D3] px-3 py-2 text-sm focus:outline-none"
                            value={form.password}
                            onChange={handleChange}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-4 w-full rounded-[100px] bg-[#FF8C00] py-2.5 text-sm font-medium text-[#051522] cursor-pointer disabled:opacity-60"
                    >
                        {loading ? "Updating..." : "Update Password"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminResetPasswordPage;
