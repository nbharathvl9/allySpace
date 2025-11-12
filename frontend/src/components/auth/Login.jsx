import React from "react";
import "./Auth.css";
import { FiUser, FiLock } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { GoogleLogin } from "@react-oauth/google";

export default function Login({ onLogin }) {
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = e.target[0].value;
    const password = e.target[1].value;

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, {
        email,
        password,
      });

      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
        toast.success("Login successful!");
        onLogin();
        navigate("/app");
      } else {
        toast.error("Login failed. Check credentials.");
      }
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Server error. Try again!");
    }
  };

  // ✅ Google Sign-In handler
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/google`, {
        token: credentialResponse.credential,
      });

      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
        toast.success("Logged in with Google!");
        onLogin();
        navigate("/app");
      } else {
        toast.error("Google login failed.");
      }
    } catch (err) {
      console.error("Google login error:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Google login failed!");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Welcome Back 👋</h2>
        <p className="auth-subtitle">Log in to continue your journey with AllySpace</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <FiUser className="input-icon" />
            <input type="text" placeholder="Email or Username" required />
          </div>
          <div className="input-group">
            <FiLock className="input-icon" />
            <input type="password" placeholder="Password" required />
          </div>
          <button type="submit" className="auth-btn">Login</button>
          <div className="divider">or</div>

          <div className="google-btn">
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => toast.error("Google Sign-In failed")} />
          </div>

          <p className="switch-text">
            Don’t have an account?{" "}
            <Link to="/signup">Sign up</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
