import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
export default function Login() {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  const { login } = useAuth(); const navigate = useNavigate(); const location = useLocation();
  async function submit(e) { e.preventDefault(); setError(""); setBusy(true); try { await login(email.trim(), password); navigate(location.state?.from || "/dashboard", { replace: true }); } catch (err) { setError(err.response?.data?.message || "Could not sign in. Check the API and your account details."); } finally { setBusy(false); } }
  return <AuthPage title="Welcome back" intro="Sign in to manage your projects and collaborations."><form className="form-stack" onSubmit={submit}><label>Email<input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required /></label><label>Password<input type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required /></label>{error && <p className="form-error">{error}</p>}<button className="button primary" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button></form><p className="auth-switch">New to campus.? <Link to="/register">Create an account</Link></p></AuthPage>;
}
export function AuthPage({ title, intro, children }) { return <div id="main" className="auth-wrap"><Link to="/login" className="brand auth-brand">campus<span>.</span></Link><section className="auth-card"><h1>{title}</h1><p>{intro}</p>{children}</section></div>; }
