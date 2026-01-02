// frontend/src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { login as apiLogin, getProfile } from "../api/auth.axios";
import { setAuthToken } from "../api/axios";

export const AuthContext = createContext({
  user: null,
  token: null,
  login: async () => {},
  logout: () => {},
  setToken: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize authentication on app load
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("token");
      
      if (storedToken) {
        setAuthToken(storedToken);
        try {
          // Validate token by fetching user profile
          const data = await getProfile();
          if (data?.user) {
            setUser(data.user);
            setToken(storedToken);
          } else {
            // Invalid response - FORCE LOGOUT - clear everything
            console.warn("Invalid token - forcing logout");
            localStorage.removeItem("token");
            setAuthToken(null);
            setToken(null);
            setUser(null);
          }
        } catch (err) {
          // Token validation failed - FORCE LOGOUT - clear everything
          console.error("Token validation failed - forcing logout:", err);
          localStorage.removeItem("token");
          setAuthToken(null);
          setToken(null);
          setUser(null);
        }
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  // Sync token with localStorage and axios
  useEffect(() => {
    if (token && !loading) {
      localStorage.setItem("token", token);
      setAuthToken(token);
    } else if (!token && !loading) {
      localStorage.removeItem("token");
      setAuthToken(null);
      setUser(null);
    }
  }, [token, loading]);

  async function login(email, password) {
    const data = await apiLogin({ email, password });
    if (data?.token) {
      setToken(data.token);
      // user may be included in response
      if (data.user) setUser(data.user);
      return data;
    }
    throw new Error(data?.message || "Login failed");
  }

  function logout() {
    // optionally call backend logout API here
    localStorage.removeItem("token");
    setAuthToken(null);
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, setToken, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth() hook — convenient consumer
 * Example: const { user, login, logout } = useAuth();
 */
export function useAuth() {
  return useContext(AuthContext);
}
