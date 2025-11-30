// src/components/admin/AddNewAdminSection.jsx
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { getRoles, createAdminUser } from "../../api/adminApi";

const AddNewAdminSection = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "",
  });

  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [rolesError, setRolesError] = useState("");

  // Load roles on mount
  useEffect(() => {
    const loadRoles = async () => {
      try {
        setLoadingRoles(true);
        setRolesError("");
        const res = await getRoles();
        const list = Array.isArray(res.data) ? res.data : [];
        setRoles(list);
      } catch (err) {
        console.error("Failed to load roles", err);
        setRolesError("Failed to load roles. Please reload the page.");
      } finally {
        setLoadingRoles(false);
      }
    };

    loadRoles();
  }, []);

  // simple formatter: "view_active_vendor" -> "View Active Vendor"
  const formatPermissionName = (name) => {
    if (!name) return "";
    return name
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const selectedRole = roles.find((r) => r.name === form.role);

  const vendorPermissions =
    selectedRole?.permissions?.filter((p) =>
      p.name.toLowerCase().includes("vendor")
    ) || [];

  const driverPermissions =
    selectedRole?.permissions?.filter((p) =>
      p.name.toLowerCase().includes("driver")
    ) || [];

  const otherPermissions =
    selectedRole?.permissions?.filter(
      (p) =>
        !p.name.toLowerCase().includes("vendor") &&
        !p.name.toLowerCase().includes("driver")
    ) || [];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.role) {
      Swal.fire("Validation error", "Name, email and role are required.", "warning");
      return;
    }

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role, // "Owner" | "Admin" | "Super Admin"
      };


      await createAdminUser(payload);

      await Swal.fire(
        "Success",
        "Admin user created and invite email sent.",
        "success"
      );

      // reset form
      setForm({
        name: "",
        email: "",
        role: "",
      });
    } catch (error) {
      console.error("Failed to create admin user", error);

      let errorMessage = "Failed to create admin user.";

      // axios error theke backend response dhorbo
      const apiData = error.response?.data;

      if (apiData) {
        // 1) jodi validation error thake (tumi jeita dekhecho)
        if (apiData.data) {
          const fieldErrors = apiData.data;

          // email er jonno specific message
          if (Array.isArray(fieldErrors.email) && fieldErrors.email.length > 0) {
            errorMessage = fieldErrors.email[0];        // 👉 "The email has already been taken."
          } else {
            // onno field thakle sobar first message join kore dekhabo
            const allMessages = Object.values(fieldErrors)
              .filter((arr) => Array.isArray(arr) && arr.length > 0)
              .map((arr) => arr[0]);

            if (allMessages.length > 0) {
              errorMessage = allMessages.join("\n");
            }
          }
        }
        // 2) na thakle generic message use korbo
        else if (apiData.message) {
          errorMessage = apiData.message;
        }
      }

      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
    }
  };

  return (
    <div className="bg-white min-h-screen p-12 rounded-[15px]">
      <h1 className="text-[26px] font-medium mb-6">Create New Role</h1>

      <form onSubmit={handleSubmit}>
        {/* new admin input fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-5">
          <div className="space-y-1">
            <label
              htmlFor="userName"
              className="block text-lg font-medium text-[#003158]"
            >
              User Name
            </label>
            <input
              type="text"
              id="userName"
              name="name"
              className="block text-[#0059A0] w-full rounded-[12px] border-[#8AB3D3]
               focus:outline-none px-3 py-2 border"
              placeholder="John Doe"
              value={form.name}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="emailAddress"
              className="block text-lg font-medium text-[#003158]"
            >
              User Email
            </label>
            <input
              type="email"
              id="emailAddress"
              name="email"
              className="block text-[#0059A0] w-full rounded-[12px] border-[#8AB3D3]
               focus:outline-none px-3 py-2 border"
              placeholder="john.doe@example.com"
              value={form.email}
              onChange={handleInputChange}
            />
          </div>

          <div className="relative space-y-1">
            <label
              htmlFor="accessAction"
              className="block text-lg font-medium text-[#003158]"
            >
              Access Role
            </label>
            <select
              id="accessAction"
              name="role"
              className="block text-[#0059A0] w-full rounded-[12px] border-[#8AB3D3]
               focus:outline-none px-3 py-2 border bg-white"
              value={form.role}
              onChange={handleInputChange}
              disabled={loadingRoles || !!rolesError}
            >
              <option value="">Select role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.name}>
                  {role.name}
                </option>
              ))}
            </select>
            {loadingRoles && (
              <p className="text-xs text-gray-500 mt-1">Loading roles...</p>
            )}
            {rolesError && (
              <p className="text-xs text-red-500 mt-1">{rolesError}</p>
            )}
          </div>
        </div>

        {/* permissions view */}
        <h2 className="text-2xl font-medium mb-4">Assign permissions</h2>

        {!form.role ? (
          <p className="text-sm text-gray-500 mb-8">
            Select a role to view its permissions.
          </p>
        ) : !selectedRole?.permissions?.length ? (
          <p className="text-sm text-gray-500 mb-8">
            No permissions configured for this role yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Vendor permissions */}
            <div>
              <h3 className="font-medium text-[#003158] mb-2">Vendor</h3>
              {vendorPermissions.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No vendor related permissions.
                </p>
              ) : (
                <ul className="space-y-2 text-[#5D768A] font-medium">
                  {vendorPermissions.map((perm) => (
                    <li key={perm.id}>{formatPermissionName(perm.name)}</li>
                  ))}
                </ul>
              )}

              {otherPermissions.length > 0 && (
                <>
                  <h3 className="font-medium text-[#003158] mt-5 mb-2">
                    Other
                  </h3>
                  <ul className="space-y-2 text-[#5D768A] font-medium">
                    {otherPermissions.map((perm) => (
                      <li key={perm.id}>{formatPermissionName(perm.name)}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            {/* Driver permissions */}
            <div>
              <h3 className="font-medium text-[#003158] mb-2">Driver</h3>
              {driverPermissions.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No driver related permissions.
                </p>
              ) : (
                <ul className="space-y-2 text-[#5D768A] font-medium">
                  {driverPermissions.map((perm) => (
                    <li key={perm.id}>{formatPermissionName(perm.name)}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* create admin action */}
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            className="rounded-[100px] bg-[#FF8C00] px-6 py-2.5 font-medium cursor-pointer text-[#051522]"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddNewAdminSection;
