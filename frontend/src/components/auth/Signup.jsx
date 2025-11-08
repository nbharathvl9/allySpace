import React from "react";
import "./Auth.css";
import { FiUser, FiMail, FiLock } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";

export default function Signup({ onSignup }) {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: call backend; on success:
    onSignup();         // set isAuthenticated = true
    navigate("/app");
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Create Account ✨</h2>
        <p className="auth-subtitle">Join AllySpace and start collaborating</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <FiUser className="input-icon" />
            <input type="text" placeholder="Username" required />
          </div>

          <div className="input-group">
            <FiMail className="input-icon" />
            <input type="email" placeholder="Email" required />
          </div>

          <div className="input-group">
            <FiLock className="input-icon" />
            <input type="password" placeholder="Password" required />
          </div>

          <button type="submit" className="auth-btn">Sign Up</button>

          <div className="divider">or</div>

          <button type="button" className="google-btn">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" />
            Sign up with Google
          </button>

          <p className="switch-text">
            Already have an account?{" "}
            <Link to="/login">Log in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
