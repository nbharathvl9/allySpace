import React, { useState } from "react";
import {
  FiX,
  FiUser,
  FiLogOut,
  FiEdit3,
  FiSave,
  FiXCircle,
  FiLayers,
} from "react-icons/fi";
import "../App.css";

export default function ProfilePopup({ user, role, projects, onClose, onLogout }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user || "",
    role: role || "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = () => {
    console.log("✅ Saved data:", formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({ username: user, role });
    setIsEditing(false);
  };

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-card profile-popup" onClick={(e) => e.stopPropagation()}>
        {/* === Header + Avatar === */}
        <div className="profile-top">
          <button className="close-btn" onClick={onClose}>
            <FiX size={22} />
          </button>

          <div className="avatar-container">
            <img
              src={`https://ui-avatars.com/api/?name=${formData.username}&background=5C63B1&color=fff&bold=true`}
              alt="Profile"
              className="profile-avatar-large"
            />
          </div>

          {/* Editable username */}
          {isEditing ? (
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="edit-input"
              placeholder="Enter username"
            />
          ) : (
            <h2 className="profile-name">@{formData.username}</h2>
          )}

          {/* Editable role */}
          {isEditing ? (
            <input
              type="text"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="edit-input small"
              placeholder="Enter role"
            />
          ) : (
            <p className="profile-role">
              <FiUser /> {formData.role}
            </p>
          )}
        </div>

        {/* === Projects Section === */}
        <div className="profile-content">
          <h3>
            <FiLayers /> Your Projects
          </h3>
          {projects?.length > 0 ? (
            <ul className="profile-projects">
              {projects.map((p, i) => (
                <li key={i}>
                  <strong>{p.name}</strong>
                  <p>{p.description}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-block">You’re not assigned to any project yet.</p>
          )}
        </div>

        {/* === Actions === */}
        <div className="profile-actions">
          {isEditing ? (
            <>
              <button className="btn save" onClick={handleSave}>
                <FiSave /> Save
              </button>
              <button className="btn cancel" onClick={handleCancel}>
                <FiXCircle /> Cancel
              </button>
            </>
          ) : (
            <>
              <button
                className="btn profile-edit"
                onClick={() => setIsEditing(true)}
              >
                <FiEdit3 /> Edit Info
              </button>
              <button className="btn danger profile-logout" onClick={onLogout}>
                <FiLogOut /> Logout
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
