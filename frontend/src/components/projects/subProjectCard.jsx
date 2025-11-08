import React from "react";
import { FiUser, FiUserMinus, FiClipboard, FiUserPlus, FiTrash2 } from "react-icons/fi";
import { useProjects } from "../../context/ProjectContext";

export default function SubprojectCard({ project, sub, myRole, onManageMembers, onAssign }){
  const { deleteSubproject } = useProjects();
  const canHead = myRole==="HEAD";
  const canLead = myRole==="SUB_HEAD" && sub.leader;

  return (
    <div className="sub-card">
      <div className="sub-top">
        <h4>{sub.name}</h4>
        <span className="leader-chip">Lead: @{sub.leader || "—"}</span>
      </div>
      <p className="sub-desc">{sub.description}</p>

      <div className="sub-meta">
        <span className="meta-chip">Members: {sub.members.length}</span>
        <span className="meta-chip">Tasks: {sub.tasks.length}</span>
      </div>

      <div className="sub-actions">
        {(myRole==="HEAD" || (myRole==="SUB_HEAD" && sub.leader===sub.leader)) && (
          <button className="btn" onClick={onManageMembers}><FiUserPlus/> Manage Members</button>
        )}
        {(myRole==="HEAD" || (myRole==="SUB_HEAD" && sub.leader)) && (
          <button className="btn" onClick={onAssign}><FiClipboard/> Assign Task</button>
        )}
        {canHead && (
          <button className="btn danger" onClick={()=>deleteSubproject(project.id, sub.id)}>
            <FiTrash2/> Delete
          </button>
        )}
      </div>

      {/* Task list preview */}
      {sub.tasks.length>0 && (
        <div className="task-list">
          {sub.tasks.slice(0,4).map(t=>(
            <div key={t.id} className={`task ${t.status}`}>{t.title} • {t.assignee} • {t.due}</div>
          ))}
        </div>
      )}
    </div>
  );
}
