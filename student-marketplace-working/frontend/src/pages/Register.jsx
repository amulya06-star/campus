import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AuthPage } from "./Login";
export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", college: "", skills: "" }); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  const { register } = useAuth(); const navigate = useNavigate();
  function change(e) { setForm(v => ({ ...v, [e.target.name]: e.target.value })); }
  async function submit(e) { e.preventDefault(); setError(""); setBusy(true); try { await register({ ...form, skills: form.skills.split(",").map(x => x.trim()).filter(Boolean) }); navigate("/dashboard", { replace: true }); } catch (err) { setError(err.response?.data?.message || "Could not create account. Check the API connection."); } finally { setBusy(false); } }
  return <AuthPage title="Create your account" intro="One student account can post projects and apply to work on them."><form className="form-stack" onSubmit={submit}><label>Full name<input name="name" autoComplete="name" value={form.name} onChange={change} minLength="2" maxLength="80" required /></label><label>Email<input name="email" type="email" autoComplete="email" value={form.email} onChange={change} required /></label><label>Password<input name="password" type="password" autoComplete="new-password" value={form.password} onChange={change} minLength="8" required /></label><label>College or university<input name="college" value={form.college} onChange={change} maxLength="120" required /></label><label>Skills <span className="muted">(comma separated)</span><input name="skills" placeholder="React, Figma, Python" value={form.skills} onChange={change} /></label>{error && <p className="form-error">{error}</p>}<button className="button primary" disabled={busy}>{busy ? "Creating account…" : "Create account"}</button></form><p className="auth-switch">Already registered? <Link to="/login">Sign in</Link></p></AuthPage>;
}
