import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api, { tokenStorage } from "../utils/api.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("gestock_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(Boolean(tokenStorage.getAccess()));

  useEffect(() => {
    const hydrateUser = async () => {
      if (!tokenStorage.getAccess()) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get("/auth/me");
        setUser(data);
        localStorage.setItem("gestock_user", JSON.stringify(data));
      } catch {
        tokenStorage.clear();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    hydrateUser();
  }, []);

  const login = async (payload) => {
    const { data } = await api.post("/auth/login", payload);
    tokenStorage.set(data);
    setUser(data.user);
    localStorage.setItem("gestock_user", JSON.stringify(data.user));
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    tokenStorage.set(data);
    setUser(data.user);
    localStorage.setItem("gestock_user", JSON.stringify(data.user));
    return data.user;
  };

  const logout = async () => {
    const refreshToken = tokenStorage.getRefresh();

    try {
      if (refreshToken) await api.post("/auth/logout", { refreshToken });
    } finally {
      tokenStorage.clear();
      setUser(null);
    }
  };

  const value = useMemo(
    () => ({ user, loading, isAuthenticated: Boolean(user), login, register, logout }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
