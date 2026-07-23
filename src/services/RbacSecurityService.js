import API from "./HttpService";

// Fetch all registered system & custom RBAC roles
export const getAllRoles = async () => {
  const response = await API.get("/api/auth/rbac/roles");
  return response.data;
};

// Fetch all granular permissions
export const getAllPermissions = async () => {
  const response = await API.get("/api/auth/rbac/permissions");
  return response.data;
};

// Create a new custom application role
export const createRole = async (data) => {
  const response = await API.post("/api/auth/rbac/roles", data);
  return response.data;
};

// Update permission matrix mapping for a role
export const updateRolePermissions = async (roleId, permissionCodes) => {
  const response = await API.put("/api/auth/rbac/matrix", {
    roleId,
    permissionCodes
  });
  return response.data;
};

// Evaluate user permission
export const checkUserPermission = async (userId, permissionCode) => {
  const response = await API.get(`/api/auth/rbac/check/${userId}?permissionCode=${permissionCode}`);
  return response.data;
};
