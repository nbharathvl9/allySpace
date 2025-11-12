import React from "react";
import { FiUserPlus, FiClipboard, FiTrash2 } from "react-icons/fi";
import axios from "../../api/axiosConfig.js";

export default function SubprojectCard({
  project,
  sub,
  myRole,
  onManageMembers,
  onAssign,
  onDeleted,
}) {
  const canHead = myRole === "HEAD";
  const canLead = myRole === "SUB_HEAD";

  const handleDelete = async () => {
    if (!window.confirm(`Delete subproject "${sub.name}"?`)) return;
    try {
      await axios.delete(`/api/team/${project.id}/subteams/${sub.id}`);
      alert(`Subproject "${sub.name}" deleted successfully!`);
      onDeleted?.(); // triggers parent refresh
    } catch (err) {
      console.error("Error deleting subproject:", err);
      alert(err?.response?.data?.message || "Failed to delete subproject.");
    }
  };

  return (
    <div className="sub-card">
      {/* Header */}
      <div className="sub-top">
        <h4>{sub.name}</h4>
        <span className="leader-chip">Lead: @{sub.leader || "—"}</span>
      </div>

      {/* Description */}
      <p className="sub-desc">{sub.description}</p>

      {/* Metadata */}
      <div className="sub-meta">
        <span className="meta-chip">Members: {sub.members?.length || 0}</span>
        <span className="meta-chip">Tasks: {sub.tasks?.length || 0}</span>
      </div>

      {/* Actions */}
      <div className="sub-actions">
        {(canHead || canLead) && (
          <>
            <button className="btn" onClick={onManageMembers}>
              <FiUserPlus /> Manage Members
            </button>
            <button className="btn" onClick={onAssign}>
              <FiClipboard /> Assign Task
            </button>
          </>
        )}
        {canHead && (
          <button className="btn danger" onClick={handleDelete}>
            <FiTrash2 /> Delete
          </button>
        )}
      </div>

      {/* Task preview */}
      {sub.tasks?.length > 0 && (
        <div className="task-list">
          {sub.tasks.slice(0, 3).map((t) => (
            <div key={t.id} className={`task ${t.status}`}>
              {t.title} • {t.assignee} • {t.due}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
