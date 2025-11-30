// src/components/adminUser/AdminUserList.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router";
import Swal from "sweetalert2";
import {
  getAdminUsers,
  updateAdminUser,
  deleteAdminUser,
} from "../../api/adminApi";

const AdminUserList = () => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [users, setUsers] = useState([]);
  console.log(users)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  // edit modal state
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    role: "Admin",
    status: "Active",
  });

  const toggleDropdown = (id) => {
    setActiveDropdown((prev) => (prev === id ? null : id));
  };

  // UI te dekhano status
  const getStatusLabel = (user) => {
    if (user.admin?.status) return user.admin.status; // "Active" / "Inactive"
    if (user.is_active === 1 || user.is_active === true) return "Active";
    if (user.status === "Approved") return "Active";
    if (user.status === "Pending") return "Inactive";
    return user.status || "Inactive";
  };

  const getRoleLabel = (user) => {
    return user.admin?.role || "Admin";
  };

  // Admin list load
  const loadAdmins = async (pageNumber = 1) => {
    try {
      setLoading(true);
      setError("");
      const res = await getAdminUsers(pageNumber);

      const pagination = res.data?.data || {};
      const list = pagination.data || [];

      setUsers(list);
      setPage(pagination.current_page || 1);
      setLastPage(pagination.last_page || 1);
    } catch (err) {
      console.error("Failed to load admin users", err);
      setError("Failed to load admin users.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins(1);
  }, []);

  // Edit modal open
  const openEditModal = (user) => {
    setEditUser(user);
    setEditForm({
      name: user.name || "",
      email: user.email || "",
      role: getRoleLabel(user),
      status: getStatusLabel(user),
    });
    setActiveDropdown(null);
  };

  const closeEditModal = () => {
    setEditUser(null);
  };

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveEdit = async () => {
    if (!editUser) return;

    try {
      await updateAdminUser(editUser.id, {
        name: editForm.name,
        email: editForm.email,
        role: editForm.role,
        status: editForm.status,
      });

      setUsers((prev) =>
        prev.map((u) =>
          u.id === editUser.id
            ? {
                ...u,
                name: editForm.name,
                email: editForm.email,
                admin: {
                  ...(u.admin || {}),
                  role: editForm.role,
                  status: editForm.status,
                },
              }
            : u
        )
      );

      Swal.fire("Updated", "Admin user updated successfully.", "success");
      closeEditModal();
    } catch (err) {
      console.error("Failed to update admin user", err);
      Swal.fire("Error", "Failed to update admin user.", "error");
    }
  };

  // Active / Inactive toggle
  const handleToggleStatus = async (user) => {
    const current = getStatusLabel(user);
    const next = current === "Active" ? "Inactive" : "Active";

    const result = await Swal.fire({
      title:
        next === "Active"
          ? "Activate this admin?"
          : "Deactivate this admin?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: next === "Active" ? "Activate" : "Deactivate",
    });

    if (!result.isConfirmed) return;

    try {
      await updateAdminUser(user.id, {
        name: user.name,
        email: user.email,
        role: getRoleLabel(user),
        status: next,
      });

      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? {
                ...u,
                admin: { ...(u.admin || {}), status: next },
              }
            : u
        )
      );

      Swal.fire("Success", `User is now ${next}.`, "success");
    } catch (err) {
      console.error("Failed to change status", err);
      Swal.fire("Error", "Failed to change user status.", "error");
    }
  };

  // Delete admin user
  const handleDeleteUser = async (user) => {
    const result = await Swal.fire({
      title: "Delete this admin user?",
      text: `User: ${user.name} (${user.email})`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      confirmButtonColor: "#EA0C0C",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteAdminUser(user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      Swal.fire("Deleted", "Admin user deleted successfully.", "success");
    } catch (err) {
      console.error("Failed to delete admin user", err);
      Swal.fire("Error", "Failed to delete admin user.", "error");
    }
  };

  const handleAction = (action, user) => {
    setActiveDropdown(null);
    if (action === "edit") openEditModal(user);
    if (action === "toggle_status") handleToggleStatus(user);
    if (action === "delete") handleDeleteUser(user);
  };

  const hasPrev = page > 1;
  const hasNext = page < lastPage;

  const goPrev = () => {
    if (hasPrev && !loading) loadAdmins(page - 1);
  };

  const goNext = () => {
    if (hasNext && !loading) loadAdmins(page + 1);
  };

  return (
    <>
      <div className="bg-white rounded-[12px] border border-[#8AB3D3]">
        {/* Header */}
        <div className="px-5  py-3 border-b border-[#8AB3D3] flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Admin List</h1>
          <Link to="/create-role">
            <button className="bg-[#FF8C00] cursor-pointer flex gap-1 items-center text-[#051522] font-medium px-5 py-3 rounded-[12px] focus:outline-none ">
              Add New{" "}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="25px"
                height="25px"
                viewBox="0 0 24 24"
                fill="none"
              >
                <rect width="24" height="24" fill="none" />
                <path
                  d="M12 6V18"
                  stroke="#000000"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6 12H18"
                  stroke="#000000"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </Link>
        </div>

        {/* Table */}
        <div className="overflow-x-auto ">
          <table className="min-w-full divide-y divide-[#8AB3D3]">
            <thead>
              <tr>
                <th className="px-5 py-3 text-left font-medium text-[#003F72] tracking-wider">
                  Full Name
                </th>
                <th className="px-5 py-3 text-left font-medium text-[#003F72] tracking-wider">
                  Email Address
                </th>
                <th className="px-5 py-3 text-left font-medium text-[#003F72] tracking-wider">
                  Roles
                </th>
                <th className="px-5 py-3 text-left font-medium text-[#003F72] tracking-wider">
                  Status
                </th>
                <th className="px-7 py-3 text-right font-medium text-[#003F72] tracking-wider" />
              </tr>
            </thead>

            <tbody className="divide-y divide-[#8AB3D3]">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-6 text-center text-sm text-gray-500"
                  >
                    Loading admin users...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-6 text-center text-sm text-red-500"
                  >
                    {error}
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-6 text-center text-sm text-gray-500"
                  >
                    No admin users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const statusLabel = getStatusLabel(user);
                  const roleLabel = getRoleLabel(user);

                  return (
                    <tr key={user.id}>
                      <td className="px-5 py-4 whitespace-nowrap font-medium text-[#5D768A]">
                        {user.name}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap font-medium text-[#5D768A]">
                        {user.email}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap font-medium text-[#5D768A]">
                        {roleLabel}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap font-medium text-[#5D768A]">
                        {statusLabel}
                      </td>
                      <td className="text-right px-6 py-4 whitespace-nowrap text-sm text-gray-500 relative">
                        <button
                          onClick={() => toggleDropdown(user.id)}
                          className="text-[#003F72] px-1 cursor-pointer font-medium"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="#003F72"
                            width="15px"
                            height="15px"
                            viewBox="0 0 32 32"
                          >
                            <path d="M13,16c0,1.654,1.346,3,3,3s3-1.346,3-3s-1.346-3-3-3S13,14.346,13,16z" />
                            <path d="M13,26c0,1.654,1.346,3,3,3s3-1.346,3-3s-1.346-3-3-3S13,24.346,13,26z" />
                            <path d="M13,6c0,1.654,1.346,3,3,3s3-1.346,3-3s-1.346-3-3-3S13,4.346,13,6z" />
                          </svg>
                        </button>

                        {activeDropdown === user.id && (
                          <div className="absolute right-10 mt-2 w-48 bg-[#FFFFFF] rounded-md shadow-sm shadow-[#00000029] z-10 border border-[#E6EEF6]">
                            <div>
                              <div className="p-3">
                                <button
                                  onClick={() =>
                                    handleAction("edit", user)
                                  }
                                  className="block w-full text-left px-4 py-2 text-[#003F72] cursor-pointer hover:bg-gray-100"
                                >
                                  Edit User
                                </button>
                              </div>

                              <hr className="w-full border-t border-[#8AB3D3]" />

                              <div className="p-3">
                                <button
                                  onClick={() =>
                                    handleAction(
                                      "toggle_status",
                                      user
                                    )
                                  }
                                  className="block w-full text-left px-4 py-2 text-[#003F72] cursor-pointer hover:bg-gray-100"
                                >
                                  {statusLabel === "Active"
                                    ? "Deactivate"
                                    : "Activate"}
                                </button>
                                <button
                                  onClick={() =>
                                    handleAction("delete", user)
                                  }
                                  className="block w-full text-left px-4 py-2 text-[#003F72] cursor-pointer hover:bg-gray-100"
                                >
                                  Delete User
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bottom right */}
        {lastPage > 1 && (
          <div className="flex items-center justify-end mt-4 mb-3 space-x-4 text-sm px-5">
            <button
              type="button"
              onClick={goPrev}
              disabled={!hasPrev || loading}
              className={`px-3 py-1 rounded-[6px] border text-xs ${
                hasPrev && !loading
                  ? "bg-white hover:bg-gray-50 cursor-pointer"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              Previous
            </button>

            <span className="text-gray-500">
              Page {page} of {lastPage}
            </span>

            <button
              type="button"
              onClick={goNext}
              disabled={!hasNext || loading}
              className={`px-3 py-1 rounded-[6px] border text-xs ${
                hasNext && !loading
                  ? "bg-white hover:bg-gray-50 cursor-pointer"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Edit modal */}
      {editUser && (
        <div
          onClick={closeEditModal}
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4"
          >
            <h3 className="text-lg font-semibold mb-2">
              Edit Admin User
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    handleEditChange("name", e.target.value)
                  }
                  className="mt-1 w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#FF8C00]"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    handleEditChange("email", e.target.value)
                  }
                  className="mt-1 w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#FF8C00]"
                />
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <select
                    value={editForm.role}
                    onChange={(e) =>
                      handleEditChange("role", e.target.value)
                    }
                    className="mt-1 w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#FF8C00]"
                  >
                    <option value="Owner">Owner</option>
                    <option value="Admin">Admin</option>
                    <option value="Super Admin">Super Admin</option>
                  </select>
                </div>

                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) =>
                      handleEditChange("status", e.target.value)
                    }
                    className="mt-1 w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#FF8C00]"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={closeEditModal}
                className="px-4 py-2 text-sm rounded-[8px] border bg-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 text-sm rounded-[8px] bg-[#FF8C00] text-[#051522] font-medium cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminUserList;
