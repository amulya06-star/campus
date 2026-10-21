import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!localStorage.getItem("token")) { setLoading(false); return; }
    api.get("/auth/me").then(({ data }) => setUser(data)).catch(() => { localStorage.removeItem("token"); setUser(null); }).finally(() => setLoading(false));
  }, []);
  const login = async (email, password) => { const { data } = await api.post("/auth/login", { email, password }); localStorage.setItem("token", data.token); setUser(data); return data; };
  const register = async (payload) => { const { data } = await api.post("/auth/register", payload); localStorage.setItem("token", data.token); setUser(data); return data; };
  const logout = () => { localStorage.removeItem("token"); setUser(null); };
  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
