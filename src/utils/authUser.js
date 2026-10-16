// src/utils/authUser.js
import { clearStoredPermissions } from "./adminPermissions";

export const getAuthUser = () => {
  const raw = localStorage.getItem("auth_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const setAuthUser = (user) => {
  if (!user) {
    localStorage.removeItem("auth_user");
  } else {
    localStorage.setItem("auth_user", JSON.stringify(user));
  }
};

export const clearAuthUser = () => {
  localStorage.removeItem("auth_user");
};

export const clearAuthSession = () => {
  clearAuthUser();
  localStorage.removeItem("token");
  clearStoredPermissions();
};

export const getUserType = () => getAuthUser()?.user_type || "admin";

export const isOutletUser = () => getUserType() === "outlet";

export const isAdminUser = () => getUserType() === "admin";
