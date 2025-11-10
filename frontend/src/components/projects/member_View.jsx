import React, { useState } from "react";
import { FiCalendar, FiSend, FiCheckCircle } from "react-icons/fi";
import "../../App.css";

export default function MemberView({ project, subproject, currentUser, onSendResponse }) {
  const [tasks, setTasks] = useState(
    subproject.tasks.filter((t) => t.assignee === currentUser)
  );
  const [myResponse, setMyResponse] = useState("");

  const handleSendResponse = () => {
    const msg = myResponse.trim();
    if (!msg) return;
    onSendResponse?.(subproject.id, {
      from: currentUser,
      to: subproject.leader,
      message: msg,
      projectId: project.id,
    });
    alert(`Sent to ${subproject.leader}`);
    setMyResponse("");
  };

  const handleMarkDone = (taskId) => {
    const updated = tasks.map((t) =>
      t.id === taskId ? { ...t, status: t.status === "done" ? "assigned" : "done" } : t
    );
    setTasks(updated);
    // mirror into subproject for now
    subproject.tasks = subproject.tasks.map((t) =>
      t.id === taskId ? { ...t, status: updated.find(u => u.id === t.id)?.status } : t
    );
  };

  return (
    <div className="content max sp-container">
      <div className="proj-header sp-header">
        <div>
          <h2 className="sp-title">{subproject.name}</h2>
          <p className="subtitle">Subproject Head: {subproject.leader}</p>
          <p className="subtitle">Main Project Head: {project.head}</p>
        </div>
        <div className="badges">
          <span className="badge role-member">Your Role: Member</span>
        </div>
      </div>

      {/* My Tasks */}
      <section className="sp-section">
        <h3 className="sp-h3">My Tasks</h3>

        {tasks.length === 0 ? (
          <div className="empty-block">No tasks assigned yet.</div>
        ) : (
          <div className="tasks-list">
            {tasks.map((t) => (
              <div key={t.id} className={`task-card ${t.status === "done" ? "is-done" : ""}`}>
                <div className="task-top">
                  <h4 className="task-title">{t.title}</h4>
                  <button
                    className="btn sm"
                    title={t.status === "done" ? "Mark as Assigned" : "Mark as Done"}
                    onClick={() => handleMarkDone(t.id)}
                  >
                    <FiCheckCircle />
                  </button>
                </div>
                <div className="task-meta">
                  <span className="meta-chip"><FiCalendar /> {t.due}</span>
                  <span className={`status ${t.status}`}>
                    {t.status === "done" ? "Done" : "Assigned"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Send response to Subproject Head */}
      <section className="sp-section">
        <h3 className="sp-h3">Send Update to Subproject Head</h3>
        <div className="send-row">
          <textarea
            className="textarea"
            rows={3}
            placeholder="Share progress or issues..."
            value={myResponse}
            onChange={(e) => setMyResponse(e.target.value)}
          />
          <button className="btn-primary send-btn" onClick={handleSendResponse}>
            <FiSend /> Send
          </button>
        </div>
      </section>
    </div>
  );
}
