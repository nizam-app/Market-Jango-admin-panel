// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router";
import { loginAdmin } from "../api/authApi";
import appLogo from "../assets/app-logo.png"; // তোমার লোগো আছে already
import { setAuthUser } from "../utils/authUser";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await loginAdmin({ email, password });

      // ধরে নিচ্ছি response:
      // { status: "success", data: { token: "..." , user: {...}} }
      const token = res?.data?.data?.token || res?.data?.token;
      const user = res?.data?.data?.user || res?.data?.user;
      if (!token) {
        throw new Error("Invalid response: token not found");
      }
      localStorage.setItem("token", token);

      if (user) {
        setAuthUser(user)
      }
      navigate("/", { replace: true }); // সফল হলে dashboard এ নেবে
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Login failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA] px-4">
      <div className="w-full max-w-4xl bg-white shadow-xl rounded-2xl overflow-hidden flex flex-col md:flex-row">

        {/* Left side – Branding */}
        <div className="hidden md:flex md:w-1/2 bg-orange-100 text-black flex-col justify-center p-10">
          <img src={appLogo} alt="Logo" className="rounded-lg w-28" />
          <div className="flex items-center gap-3 mb-6">
            <h1 className="text-2xl font-semibold">Admin Portal</h1>
          </div>
          <p className="text-sm opacity-90">
            Manage vendors, drivers, orders and settings from one powerful
            dashboard.
          </p>
        </div>

        {/* Right side – Form */}
        <div className="w-full md:w-1/2 p-8 md:p-10">
          {/* Mobile logo */}
          <div className="md:hidden flex items-center gap-3 mb-6">
            <img src={appLogo} alt="Logo" className="w-8 h-8 rounded-lg" />
            <h1 className="text-xl font-semibold">Admin Portal</h1>
          </div>

          <h2 className="text-2xl font-semibold mb-2">Sign in</h2>
          <p className="text-sm text-gray-500 mb-6">
            Enter your admin credentials to access the dashboard.
          </p>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 inline-flex items-center justify-center rounded-lg bg-indigo-600 text-white text-sm font-medium px-4 py-2.5 hover:bg-indigo-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-xs text-gray-400">
            By logging in you agree to the Terms &amp; Conditions and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
