import React, { useMemo, useState } from "react";
import { FiUserPlus, FiTrash2, FiClipboard, FiCalendar, FiSend, FiCheckCircle } from "react-icons/fi";
import axios from "../../api/axiosConfig.js";
import "./subprojecthead.css";

export default function SubprojectHeadView({ project, subproject, onSendResponse }) {
  const [members, setMembers] = useState([...subproject.members]);
  const [tasks, setTasks] = useState([...subproject.tasks]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState("");
  const [newTask, setNewTask] = useState({ title: "", assignedTo: "", deadline: "" });
  const [headMessage, setHeadMessage] = useState("");
  const [loadingMember, setLoadingMember] = useState(false);
  const [loadingTask, setLoadingTask] = useState(false);

  const canAddTask = useMemo(
    () => newTask.title.trim() && newTask.assignedTo.trim() && newTask.deadline.trim(),
    [newTask]
  );

  // Add member by username (e.g. "@sam" or "sam")
  const handleAddMember = async () => {
    const username = newMember.trim().replace("@", "");
    if (!username) return;

    try {
      setLoadingMember(true);
      const res = await axios.post(
        `/api/team/${project.id}/subteams/${subproject.id}/add-member`,
        { memberUsername: username }
      );
      // server returns the updated member list (recommended)
      if (res.data && Array.isArray(res.data.members)) {
        setMembers(res.data.members);
      } else {
        // optimistic fallback
        setMembers((prev) => [...prev, username]);
      }
      setNewMember("");
      setShowAddMember(false);
    } catch (err) {
      console.error("Error adding member:", err);
      alert(err?.response?.data?.message || "Failed to add member.");
    } finally {
      setLoadingMember(false);
    }
  };

  // Remove member by username
  const handleRemoveMember = async (memberUsername) => {
    if (!window.confirm(`Remove ${memberUsername} from ${subproject.name}?`)) return;
    try {
      const username = memberUsername.replace("@", "");
      const res = await axios.delete(
        `/api/team/${project.id}/subteams/${subproject.id}/remove-member/${encodeURIComponent(username)}`
      );
      if (res.data && Array.isArray(res.data.members)) {
        setMembers(res.data.members);
      } else {
        setMembers((prev) => prev.filter((m) => m !== memberUsername));
      }
    } catch (err) {
      console.error("Error removing member:", err);
      alert(err?.response?.data?.message || "Failed to remove member.");
    }
  };

  // Create task — backend accepts assignedToUsername
  const handleAddTask = async () => {
    if (!canAddTask) return;
    try {
      setLoadingTask(true);
      const payload = {
        title: newTask.title,
        assignedToUsername: newTask.assignedTo.replace("@", ""),
        deadline: newTask.deadline,
      };
      const res = await axios.post(
        `/api/team/${project.id}/subteams/${subproject.id}/tasks`,
        payload
      );

      // expect server to return the created task
      const task = res.data.task;
      if (task) {
        setTasks((prev) => [
          ...prev,
          {
            id: task._id || task.id,
            title: task.title,
            assignee: task.assignedToUsername || task.assignedTo || task.assignee,
            due: task.deadline || task.due || task.dueDate,
            status: task.status || "assigned",
          },
        ]);
      } else {
        // optimistic fallback
        setTasks((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            title: newTask.title,
            assignee: newTask.assignedTo,
            due: newTask.deadline,
            status: "assigned",
          },
        ]);
      }

      setNewTask({ title: "", assignedTo: "", deadline: "" });
    } catch (err) {
      console.error("Error assigning task:", err);
      alert(err?.response?.data?.message || "Failed to assign task.");
    } finally {
      setLoadingTask(false);
    }
  };

  const handleToggleDone = (id) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: t.status === "done" ? "assigned" : "done" } : t))
    );
  };

  const handleDeleteTask = (id) => setTasks((prev) => prev.filter((t) => t.id !== id));

  const handleSendToHead = () => {
    const msg = headMessage.trim();
    if (!msg) return;
    onSendResponse?.(subproject.id, msg);
    alert(`Sent to ${project.head}: ${msg}`);
    setHeadMessage("");
  };

  return (
    <div className="sp-container">
      {/* HEADER */}
      <header className="sp-header glass">
        <div className="sp-info">
          <h2 className="sp-title">{subproject.name}</h2>
          <p className="sp-meta">Leader: {subproject.leader}</p>
          <p className="sp-meta">Project Head: {project.head}</p>
        </div>
        <span className="sp-role-badge">Subproject Head</span>
      </header>

      {/* MEMBERS */}
      <section className="sp-section glass">
        <div className="section-header">
          <h3>Team Members</h3>
          <button className="btn-primary" onClick={() => setShowAddMember(true)}>
            <FiUserPlus /> Add
          </button>
        </div>

        <div className="chips-wrap">
          {members.map((m) => (
            <div key={m} className="chip">
              {m}
              <button className="chip-x" onClick={() => handleRemoveMember(m)}>
                <FiTrash2 />
              </button>
            </div>
          ))}
        </div>

        {showAddMember && (
          <div className="popup-overlay" onClick={() => setShowAddMember(false)}>
            <div className="popup-card" onClick={(e) => e.stopPropagation()}>
              <h3>Add Member</h3>
              <input
                type="text"
                placeholder="@username"
                value={newMember}
                onChange={(e) => setNewMember(e.target.value)}
              />
              <div className="popup-actions">
                <button className="cancel-btn" onClick={() => setShowAddMember(false)}>
                  Cancel
                </button>
                <button className="create-btn-popup" onClick={handleAddMember} disabled={loadingMember}>
                  {loadingMember ? "Adding..." : "Add"}
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* TASKS */}
      <section className="sp-section glass">
        <div className="section-header">
          <h3>Tasks</h3>
        </div>

        <div className="tasks-grid">
          {tasks.map((t) => (
            <div key={t.id} className={`task-card ${t.status}`}>
              <div className="task-top">
                <h4>{t.title}</h4>
                <div className="task-actions">
                  <button onClick={() => handleToggleDone(t.id)}>
                    <FiCheckCircle />
                  </button>
                  <button className="danger" onClick={() => handleDeleteTask(t.id)}>
                    <FiTrash2 />
                  </button>
                </div>
              </div>

              <div className="task-meta">
                <span>
                  <FiClipboard /> {t.assignee}
                </span>
                <span>
                  <FiCalendar /> {t.due}
                </span>
                <span className={`status ${t.status}`}>{t.status}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="form-row">
          <input
            type="text"
            placeholder="Task title"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          />
          <input
            type="text"
            placeholder="Assign to (@username)"
            value={newTask.assignedTo}
            onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
          />
          <input
            type="date"
            value={newTask.deadline}
            onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
          />
          <button className={`btn-primary ${!canAddTask ? "disabled" : ""}`} onClick={handleAddTask} disabled={!canAddTask || loadingTask}>
            {loadingTask ? "Adding…" : "Add Task"}
          </button>
        </div>
      </section>

      {/* SEND TO HEAD */}
      <section className="sp-section glass">
        <h3>Send Update to Project Head</h3>
        <div className="send-row">
          <textarea placeholder="Write your update..." rows={3} value={headMessage} onChange={(e) => setHeadMessage(e.target.value)} />
          <button className="btn-primary send-btn" onClick={handleSendToHead}>
            <FiSend /> Send
          </button>
        </div>
      </section>
    </div>
  );
}
