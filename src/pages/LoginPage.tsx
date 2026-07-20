import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import OAuthButtons from "../components/OAuthButtons";
import { API_URL } from '../utils/api';
import { useToast } from "../context/ToastContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        toast.error("Login Failed", data.error || "Please check your credentials");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      toast.success("Welcome back!", `Logged in as ${data.user.username}`);
      navigate("/dashboard");
    } catch (err) {
      setError('Network error. Please try again.');
      toast.error("Network Error", "Please check your connection and try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="login-container">
        <div className="auth-logo">
          <h1>code(<span className="logo-o">O</span>)n</h1>
        </div>

        <h2 className="auth-title">Welcome Back</h2>
        <p className="subtitle">Login to continue using CodeOn</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <OAuthButtons action="Login" />

        <p className="footer-text">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}