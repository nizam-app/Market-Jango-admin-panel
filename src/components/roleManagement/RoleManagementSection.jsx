import React, { useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  assignRolePermissions,
  createRole,
  deleteRole,
  getPermissions,
  getRoles,
  updateRole,
} from "../../api/adminApi";
import { formatPermissionLabel, PERMISSION_GROUPS } from "../../utils/adminPermissions";

const formatPermissionName = formatPermissionLabel;

const RoleManagementSection = () => {
  const [roles, setRoles] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [selectedPermIds, setSelectedPermIds] = useState([]);
  const [newRoleName, setNewRoleName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const selectedRole = roles.find((r) => r.id === selectedRoleId) || null;

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [rolesRes, permsRes] = await Promise.all([getRoles(), getPermissions()]);
      const roleList = Array.isArray(rolesRes.data) ? rolesRes.data : [];
      const permList = Array.isArray(permsRes.data) ? permsRes.data : [];
      setRoles(roleList);
      setAllPermissions(permList);

      setSelectedRoleId((prevId) => {
        const nextId =
          prevId && roleList.some((r) => r.id === prevId)
            ? prevId
            : roleList[0]?.id ?? null;
        const role = roleList.find((r) => r.id === nextId);
        if (role) {
          setSelectedPermIds((role.permissions || []).map((p) => p.id));
        }
        return nextId;
      });
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to load roles or permissions.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSelectRole = (roleId) => {
    setSelectedRoleId(roleId);
    const role = roles.find((r) => r.id === roleId);
    setSelectedPermIds((role?.permissions || []).map((p) => p.id));
  };

  const togglePermission = (permId) => {
    setSelectedPermIds((prev) =>
      prev.includes(permId)
        ? prev.filter((id) => id !== permId)
        : [...prev, permId]
    );
  };

  const handleCreateRole = async () => {
    const name = newRoleName.trim();
    if (!name) {
      Swal.fire("Validation", "Enter a role name.", "warning");
      return;
    }
    try {
      await createRole(name);
      setNewRoleName("");
      await loadData();
      Swal.fire("Success", "Role created.", "success");
    } catch (err) {
      const msg = err.response?.data?.message || "Could not create role.";
      Swal.fire("Error", msg, "error");
    }
  };

  const handleRenameRole = async () => {
    if (!selectedRole || selectedRole.name === "Owner") {
      Swal.fire("Not allowed", "The Owner role cannot be renamed.", "warning");
      return;
    }
    const { value: name } = await Swal.fire({
      title: "Rename role",
      input: "text",
      inputValue: selectedRole.name,
      showCancelButton: true,
    });
    if (!name?.trim()) return;
    try {
      await updateRole(selectedRole.id, name.trim());
      await loadData();
      Swal.fire("Success", "Role updated.", "success");
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Update failed.", "error");
    }
  };

  const handleDeleteRole = async () => {
    if (!selectedRole) return;
    if (selectedRole.name === "Owner") {
      Swal.fire("Not allowed", "The Owner role cannot be deleted.", "warning");
      return;
    }
    const confirm = await Swal.fire({
      title: `Delete role "${selectedRole.name}"?`,
      icon: "warning",
      showCancelButton: true,
    });
    if (!confirm.isConfirmed) return;
    try {
      await deleteRole(selectedRole.id);
      setSelectedRoleId(null);
      setSelectedPermIds([]);
      await loadData();
      Swal.fire("Deleted", "Role removed.", "success");
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Delete failed.", "error");
    }
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    if (selectedRole.name === "Owner") {
      Swal.fire(
        "Not allowed",
        "Owner permissions are managed via database seed for safety.",
        "warning"
      );
      return;
    }
    try {
      setSaving(true);
      await assignRolePermissions(selectedRole.id, selectedPermIds);
      await loadData();
      Swal.fire("Success", "Permissions saved for this role.", "success");
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Save failed.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white min-h-screen p-12 rounded-[15px] text-gray-500">
        Loading roles…
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen p-8 md:p-12 rounded-[15px]">
      <h1 className="text-[26px] font-medium mb-2">Roles &amp; permissions</h1>
      <p className="text-sm text-gray-500 mb-8">
        Create roles and choose which permissions each role has. Assign roles when
        creating admin users.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-4">
          <h2 className="font-medium text-[#003158]">Roles</h2>
          <ul className="border border-[#8AB3D3] rounded-xl divide-y divide-[#8AB3D3]">
            {roles.map((role) => (
              <li key={role.id}>
                <button
                  type="button"
                  onClick={() => handleSelectRole(role.id)}
                  className={`w-full text-left px-4 py-3 text-sm ${
                    selectedRoleId === role.id
                      ? "bg-[#E6F0F8] font-medium text-[#003158]"
                      : "text-[#5D768A] hover:bg-gray-50"
                  }`}
                >
                  {role.name}
                  <span className="block text-xs text-gray-400">
                    {(role.permissions || []).length} permissions
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="New role name"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              className="flex-1 border border-[#8AB3D3] rounded-lg px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={handleCreateRole}
              className="bg-[#FF8C00] px-4 py-2 rounded-lg text-sm font-medium"
            >
              Add
            </button>
          </div>

          {selectedRole && (
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleRenameRole}
                className="text-sm border px-3 py-1.5 rounded-lg"
              >
                Rename
              </button>
              <button
                type="button"
                onClick={handleDeleteRole}
                className="text-sm border border-red-300 text-red-700 px-3 py-1.5 rounded-lg"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <h2 className="font-medium text-[#003158] mb-4">
            Permissions
            {selectedRole ? ` — ${selectedRole.name}` : ""}
          </h2>
          {!selectedRole ? (
            <p className="text-sm text-gray-500">Select a role.</p>
          ) : (
            <>
              <div className="max-h-[480px] overflow-y-auto border border-[#8AB3D3] rounded-xl p-4 space-y-6">
                {PERMISSION_GROUPS.map((group) => {
                  const grouped =
                    group.keys === null
                      ? allPermissions.filter(
                          (p) =>
                            !PERMISSION_GROUPS.some(
                              (g) => g.keys && g.keys.includes(p.name)
                            )
                        )
                      : allPermissions.filter((p) => group.keys.includes(p.name));
                  if (!grouped.length) return null;
                  return (
                    <div key={group.label}>
                      <h3 className="text-sm font-medium text-[#003158] mb-2">
                        {group.label}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {grouped.map((perm) => (
                          <label
                            key={perm.id}
                            className="flex items-start gap-2 text-sm text-[#5D768A] cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedPermIds.includes(perm.id)}
                              onChange={() => togglePermission(perm.id)}
                              disabled={selectedRole.name === "Owner"}
                            />
                            <span>{formatPermissionName(perm.name)}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  disabled={saving || selectedRole.name === "Owner"}
                  onClick={handleSavePermissions}
                  className="rounded-[100px] bg-[#FF8C00] px-6 py-2.5 font-medium disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save permissions"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoleManagementSection;
