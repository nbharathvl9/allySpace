import React, { useState, useEffect } from "react";
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
import handleLogoutFn from "./components/auth/logout.jsx";
import NotificationList from "./components/notifications/NotificationList.jsx";

import axios from "./api/axiosConfig.js"

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./styles/global.css";
import "./styles/navbar.css";
import "./styles/sidebar.css";
import "./styles/maincontent.css";

function MainApp() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hasNotification] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // ✅ must hit your backend route /api/auth/me
        const res = await axios.get("/auth/me");
        setCurrentUser(res.data.userName);
      } catch (err) {
        console.error("Failed to fetch current user:", err);
        navigate("/login");
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await handleLogoutFn(navigate);
    toast.info("You’ve been logged out!");
  };

  if (loadingUser) return <p className="content">Loading user...</p>;
  if (!currentUser) return <Navigate to="/login" replace />;

  const showSidebar = location.pathname.startsWith("/app");
  

  return (
    <ProjectProvider currentUser={currentUser}>
      <div className="app">
        {menuOpen && <div className="overlay" onClick={() => setMenuOpen(false)} />}

        {/* --- Navbar --- */}
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
  <SearchBar />
</div>


          {/* --- Right icons --- */}
          <div className="topbar-right">
            {/* Notifications */}
            <div className="notification-wrapper">
              <button
                className="icon-btn"
                aria-label="Notifications"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <FiBell />
                {hasNotification && <span className="notif-dot"></span>}
              </button>
              {showNotifications && (
                <div className="notification-popup">
                  <h4>Notifications</h4>
                  <NotificationList />
                </div>
              )}
            </div>

            {/* Profile */}
            <button className="profile-btn" onClick={() => setShowProfile(true)}>
              <img
                src={`https://ui-avatars.com/api/?name=${currentUser}&background=5C63B1&color=fff&bold=true`}
                alt="profile"
              />
            </button>

            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        {/* --- Sidebar & main content --- */}
        <div className="app-body">
          {showSidebar && <Sidebar open={menuOpen} close={() => setMenuOpen(false)} />}
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

        <button className="floating-msg-btn" aria-label="Messages">
          <FiMessageSquare />
        </button>

        {showProfile && (
          <ProfilePopup
            user={currentUser}
            role="Project Head"
            onClose={() => setShowProfile(false)}
            onLogout={handleLogout}
          />
        )}
      </div>
    </ProjectProvider>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? "/app" : "/login"} replace />}
        />
        <Route
          path="/login"
          element={<Login onLogin={() => setIsAuthenticated(true)} />}
        />
        <Route
          path="/signup"
          element={<Signup onSignup={() => setIsAuthenticated(true)} />}
        />
        <Route
          path="/app/*"
          element={isAuthenticated ? <MainApp /> : <Navigate to="/login" replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
