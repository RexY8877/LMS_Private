/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";
import { setAuthToken } from "./api";

// We export the context so you can still use useContext(AuthContext) if you want
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { _id, name, email, role, token }

  // Load from localStorage on first load
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      // Defer state update to avoid React Fast Refresh warning
      Promise.resolve().then(() => {
        setAuthToken(token);
        setUser(JSON.parse(userData));
      });
    }
  }, []);

  const login = (userData) => {
    // userData = { _id, name, email, role, token }
    setAuthToken(userData.token);
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Optional helper hook – use this or useContext(AuthContext) directly
export const useAuth = () => useContext(AuthContext);
