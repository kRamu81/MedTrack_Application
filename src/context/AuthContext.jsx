import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getAuthorityVersion } from "../services/AuthService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = sessionStorage.getItem("medtrack_user");
    if (savedUser) return JSON.parse(savedUser);
    
    // Auto-login for local development UI testing removed to allow actual login flow
    return null;
  });

  const [authorityState, setAuthorityState] = useState(() => {
    const savedAuth = sessionStorage.getItem("medtrack_authority");
    return savedAuth ? JSON.parse(savedAuth) : { authorityVersion: 1, permissions: [] };
  });

  const [authorityLoading, setAuthorityLoading] = useState(false);

  const login = (userData) => {
    setUser(userData);
    sessionStorage.setItem("medtrack_user", JSON.stringify(userData));
    if (userData && userData.id) {
      fetchUserAuthority(userData.id);
    }
  };

  const logout = useCallback(() => {
    setUser(null);
    setAuthorityState({ authorityVersion: 1, permissions: [] });
    sessionStorage.removeItem("medtrack_user");
    sessionStorage.removeItem("medtrack_authority");
  }, []);

  const fetchUserAuthority = useCallback(async (userId) => {
    if (!userId || userId === "demo-user") return;
    setAuthorityLoading(true);
    try {
      const data = await getAuthorityVersion(userId);
      if (data) {
        const newAuth = {
          authorityVersion: data.authorityVersion || 1,
          permissions: data.permissions || [],
          role: data.role || "",
          active: data.active
        };

        // If backend authority version has changed and active sessions were revoked
        if (authorityState.authorityVersion && data.authorityVersion > authorityState.authorityVersion) {
          console.warn("Authority version mismatch detected. Session revoked by administrator.");
          // Trigger logout if authority version was bumped on server
        }

        setAuthorityState(newAuth);
        sessionStorage.setItem("medtrack_authority", JSON.stringify(newAuth));
      }
    } catch (err) {
      console.error("Failed to fetch user authority state:", err);
    } finally {
      setAuthorityLoading(false);
    }
  }, [authorityState.authorityVersion]);

  // Periodic verification of security authority version (every 60 seconds)
  useEffect(() => {
    if (user && user.id) {
      fetchUserAuthority(user.id);
      const interval = setInterval(() => {
        fetchUserAuthority(user.id);
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [user?.id, fetchUserAuthority]);

  const hasPermission = (permissionName) => {
    if (!permissionName) return true;
    return authorityState.permissions.includes(permissionName);
  };

  const refreshAuthority = () => {
    if (user && user.id) {
      return fetchUserAuthority(user.id);
    }
    return Promise.resolve();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authorityState,
        authorityVersion: authorityState.authorityVersion,
        permissions: authorityState.permissions,
        authorityLoading,
        login,
        logout,
        hasPermission,
        refreshAuthority
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
