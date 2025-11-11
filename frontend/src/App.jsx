import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import {
  FiMenu,
  FiBell,
  FiMessageSquare,
  FiSearch,
} from "react-icons/fi";
import ProfilePopup from "./components/ProfilePopup.jsx";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import Sidebar from "./components/sidebar/sidebar.jsx";
import ProjectBoard from "./components/projects/projectBoard.jsx";
import { ProjectProvider } from "./context/ProjectContext.jsx";
import handleLogoutFn from "./components/auth/logout.jsx"; // ✅ renamed to avoid confusion

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Styles
import "./styles/global.css";
import "./styles/navbar.css";
import "./styles/sidebar.css";
import "./styles/maincontent.css";

/* ---------------- Main Protected Application ---------------- */
function MainApp() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hasNotification] = useState(true);
  const [showProfile, setShowProfile] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // 🔹 Temporary placeholders until backend integration
  const [currentUser] = useState("Sam");
  const [isHead] = useState(true);
  const [teams] = useState([
    { name: "AI Club", description: "Exploring artificial intelligence." },
    { name: "Hackathon Team", description: "Building cool stuff fast!" },
    { name: "Open Source Squad", description: "Contributing to open-source." },
  ]);

  // ✅ Clean, unified logout handler (calls backend + clears token + navigates)
  const handleLogout = async () => {
    await handleLogoutFn(navigate);
    toast.info("You’ve been logged out!");
  };

  const showSidebar = location.pathname.startsWith("/app");

  return (
    <div className="app">
      {/* Overlay for sidebar */}
      {menuOpen && <div className="overlay" onClick={() => setMenuOpen(false)} />}

      {/* --- Top Navbar --- */}
      <header className="topbar">
        <div className="topbar-left">
          <button
            className="menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <FiMenu />
          </button>
          <h1 className="logo">AllySpace</h1>
        </div>

        {/* Center: Search Bar */}
        <div className="topbar-center">
          <div className="search-container">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search..."
              className="search-input"
            />
          </div>
        </div>

        {/* Right section */}
        <div className="topbar-right">
          <button className="icon-btn" aria-label="Notifications">
            <FiBell />
            {hasNotification && <span className="notif-dot"></span>}
          </button>

          {/* Profile Button */}
          <button
            className="profile-btn"
            aria-label="Profile"
            onClick={() => setShowProfile(true)}
          >
            <img
              src={`https://ui-avatars.com/api/?name=${currentUser}&background=5C63B1&color=fff&bold=true`}
              alt="profile"
            />
          </button>

          {/* Logout Button */}
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* --- Sidebar & Main Content --- */}
      <div className="app-body">
        {showSidebar && (
          <Sidebar open={menuOpen} close={() => setMenuOpen(false)} />
        )}
        <main className="main">
          <Routes>
            <Route path="/projects/:projectId" element={<ProjectBoard />} />
            <Route
              path=""
              element={
                <div className="content">
                  <h2 className="title">Welcome to AllySpace 🌌</h2>
                  <p className="subtitle">
                    Pick a project from the left or create a new one.
                  </p>
                </div>
              }
            />
          </Routes>
        </main>
      </div>

      {/* Floating Message Button */}
      <button className="floating-msg-btn" aria-label="Messages">
        <FiMessageSquare />
      </button>

      {/* Profile Popup */}
      {showProfile && (
        <ProfilePopup
          user={currentUser}
          role={isHead ? "Project Head" : "Member / Subproject Head"}
          projects={teams}
          onClose={() => setShowProfile(false)}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

/* ---------------- Root Application ---------------- */
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Router>
      <ProjectProvider>
        <Routes>
          {/* Redirect root to login or app */}
          <Route
            path="/"
            element={
              <Navigate to={isAuthenticated ? "/app" : "/login"} replace />
            }
          />

          {/* Public Routes */}
          <Route
            path="/login"
            element={<Login onLogin={() => setIsAuthenticated(true)} />}
          />
          <Route
            path="/signup"
            element={<Signup onSignup={() => setIsAuthenticated(true)} />}
          />

          {/* Protected Routes */}
          <Route
            path="/app/*"
            element={
              isAuthenticated ? <MainApp /> : <Navigate to="/login" replace />
            }
          />

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ProjectProvider>
    </Router>
  );
}
