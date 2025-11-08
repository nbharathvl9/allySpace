import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes, Route, Navigate, useNavigate, useLocation
} from "react-router-dom";
import { FiMenu, FiX, FiBell, FiMessageSquare, FiSearch } from "react-icons/fi";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import Sidebar from "./components/sidebar/sidebar.jsx";
import ProjectBoard from "./components/projects/projectBoard.jsx";
import { ProjectProvider } from "./context/ProjectContext.jsx";
import "./App.css";
import "./styles/variables.css";

function MainApp() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hasNotification] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => navigate("/login");

  const showSidebar = location.pathname.startsWith("/app");

  return (
    <div className="app">
      {menuOpen && <div className="overlay" onClick={() => setMenuOpen(false)} />}
      {/* Topbar */}
      <header className="topbar">
        <div className="topbar-left">
          <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            <FiMenu />
          </button>
          <h1 className="logo">AllySpace</h1>
        </div>
        <div className="topbar-center">
          <div className="search-container">
            <FiSearch className="search-icon" />
            <input type="text" placeholder="Search..." className="search-input" />
          </div>
        </div>
        <div className="topbar-right">
          <button className="icon-btn" aria-label="Notifications">
            <FiBell /> {hasNotification && <span className="notif-dot" />}
          </button>
          <button className="profile-btn" aria-label="Profile">
            <img src="https://ui-avatars.com/api/?name=Sam&background=5C63B1&color=fff&bold=true" alt="profile" />
          </button>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {/* Sidebar + Main */}
      <div className="app-body">
        {showSidebar && (
          <Sidebar open={menuOpen} close={() => setMenuOpen(false)} />
        )}
        <main className="main">
          <Routes>
            <Route path="/projects/:projectId" element={<ProjectBoard />} />
            <Route path="" element={
              <div className="content">
                <h2 className="title">Welcome to AllySpace 🌌</h2>
                <p className="subtitle">Pick a project from the left or create a new one.</p>
              </div>
            } />
          </Routes>
        </main>
      </div>

      {/* Floating message */}
      <button className="floating-msg-btn" aria-label="Messages">
        <FiMessageSquare />
      </button>
    </div>
  );
}

export default function App(){
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  return (
    <Router>
      <ProjectProvider>
        <Routes>
          <Route path="/" element={<Navigate to={isAuthenticated?"/app":"/login"} replace />} />
          <Route path="/login" element={<Login onLogin={()=>setIsAuthenticated(true)} />} />
          <Route path="/signup" element={<Signup onSignup={()=>setIsAuthenticated(true)} />} />
          <Route path="/app/*" element={isAuthenticated ? <MainApp/> : <Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ProjectProvider>
    </Router>
  );
}
