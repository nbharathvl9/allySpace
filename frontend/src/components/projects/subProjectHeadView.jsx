import React, { useMemo, useState } from "react";
import {
  FiUserPlus,
  FiTrash2,
  FiClipboard,
  FiCalendar,
  FiSend,
  FiCheckCircle,
} from "react-icons/fi";
import "../../App.css";
import "./subprojecthead.css"
export default function SubprojectHeadView({ project, subproject, onSendResponse }) {
  const [members, setMembers] = useState([...subproject.members]);
  const [tasks, setTasks] = useState([...subproject.tasks]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState("");
  const [newTask, setNewTask] = useState({ title: "", assignedTo: "", deadline: "" });
  const [headMessage, setHeadMessage] = useState("");

  const canAddTask = useMemo(
    () => newTask.title.trim() && newTask.assignedTo.trim() && newTask.deadline.trim(),
    [newTask]
  );

  const handleAddMember = () => {
    const name = newMember.trim();
    if (!name || members.includes(name)) return;
    const updated = [...members, name];
    setMembers(updated);
    subproject.members = updated;
    setNewMember("");
    setShowAddMember(false);
  };

  const handleRemoveMember = (m) => {
    const updated = members.filter((x) => x !== m);
    setMembers(updated);
    subproject.members = updated;
  };

  const handleAddTask = () => {
    if (!canAddTask) return;
    const task = {
      id: Date.now().toString(),
      title: newTask.title.trim(),
      assignee: newTask.assignedTo.trim(),
      due: newTask.deadline,
      status: "assigned",
      response: "",
    };
    const updated = [...tasks, task];
    setTasks(updated);
    subproject.tasks = updated;
    setNewTask({ title: "", assignedTo: "", deadline: "" });
  };

  const handleDeleteTask = (id) => {
    const updated = tasks.filter((t) => t.id !== id);
    setTasks(updated);
    subproject.tasks = updated;
  };

  const handleToggleDone = (id) => {
    const updated = tasks.map((t) =>
      t.id === id ? { ...t, status: t.status === "done" ? "assigned" : "done" } : t
    );
    setTasks(updated);
    subproject.tasks = updated;
  };

  const handleTaskResponse = (id, msg) => {
    const updated = tasks.map((t) => (t.id === id ? { ...t, response: msg } : t));
    setTasks(updated);
    subproject.tasks = updated;
  };

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
                <button className="create-btn-popup" onClick={handleAddMember}>
                  Add
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
                <span><FiClipboard /> {t.assignee}</span>
                <span><FiCalendar /> {t.due}</span>
                <span className={`status ${t.status}`}>{t.status}</span>
              </div>

              <textarea
                className="task-response"
                rows={2}
                placeholder="Add or update response..."
                value={t.response || ""}
                onChange={(e) => handleTaskResponse(t.id, e.target.value)}
              />
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
          <button
            className={`btn-primary ${!canAddTask ? "disabled" : ""}`}
            onClick={handleAddTask}
            disabled={!canAddTask}
          >
            Add Task
          </button>
        </div>
      </section>

      {/* SEND TO HEAD */}
      <section className="sp-section glass">
        <h3>Send Update to Project Head</h3>
        <div className="send-row">
          <textarea
            placeholder="Write your update..."
            rows={3}
            value={headMessage}
            onChange={(e) => setHeadMessage(e.target.value)}
          />
          <button className="btn-primary send-btn" onClick={handleSendToHead}>
            <FiSend /> Send
          </button>
        </div>
      </section>
    </div>
  );
}
