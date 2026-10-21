import { BrowserRouter, Link, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Marketplace from "./pages/Marketplace";
import PostProject from "./pages/PostProject";
import ProjectDetails from "./pages/ProjectDetails";
import Workspace from "./pages/Workspace";
import "./app.css";
function Guard() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="center-page">Loading your account…</div>;
  return user ? <Outlet /> : <Navigate to="/login" replace state={{ from: location.pathname }} />;
}
function SignedOutOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="center-page">Loading…</div>;
  return user ? <Navigate to="/dashboard" replace /> : children;
}
function Shell() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  return <div className="app-shell"><header className="app-header"><Link to="/dashboard" className="brand">campus<span>.</span></Link><nav><Link to="/marketplace">Marketplace</Link><Link to="/dashboard">Dashboard</Link><Link to="/projects/new">Post a project</Link></nav><div className="account-chip"><span>{user?.name}</span><button onClick={() => { logout(); nav("/login", { replace: true }); }}>Log out</button></div></header><main id="main" className="app-main"><Outlet /></main><footer className="app-footer">Student Marketplace · Account-based project collaboration</footer></div>;
}
export default function App() {
  return <AuthProvider><BrowserRouter><Toaster position="bottom-right" richColors closeButton /><Routes><Route path="/" element={<Navigate to="/dashboard" replace />} /><Route path="/login" element={<SignedOutOnly><Login /></SignedOutOnly>} /><Route path="/register" element={<SignedOutOnly><Register /></SignedOutOnly>} /><Route element={<Guard />}><Route element={<Shell />}><Route path="/dashboard" element={<Dashboard />} /><Route path="/marketplace" element={<Marketplace />} /><Route path="/projects/new" element={<PostProject />} /><Route path="/projects/:id" element={<ProjectDetails />} /><Route path="/workspace/:id" element={<Workspace />} /></Route></Route><Route path="*" element={<Navigate to="/" replace />} /></Routes></BrowserRouter></AuthProvider>;
}
