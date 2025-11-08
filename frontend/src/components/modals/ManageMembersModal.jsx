import React, { useState } from "react";
import { useProjects } from "../../context/ProjectContext";

export default function ManageMembersModal({ project, sub, onClose }){
  const { addMember, removeMember, setSubLeader } = useProjects();
  const [username, setUsername] = useState("");
  const [leader, setLeader] = useState(sub.leader || "");

  const add = ()=>{
    if(!username.trim()) return;
    addMember(project.id, sub.id, username.trim());
    setUsername("");
  };
  const setLeaderNow = ()=>{
    if(!leader.trim()) return;
    setSubLeader(project.id, sub.id, leader.trim());
  };

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-card" onClick={e=>e.stopPropagation()}>
        <h3>Manage Members • {sub.name}</h3>

        <div className="row">
          <input placeholder="Add member by username" value={username} onChange={e=>setUsername(e.target.value)}/>
          <button className="create-btn-popup" onClick={add}>Add</button>
        </div>

        <div className="list">
          {sub.members.length===0 && <div className="empty-block">No members yet.</div>}
          {sub.members.map(m=>(
            <div key={m} className="row between">
              <span>@{m}</span>
              <button className="cancel-btn" onClick={()=>removeMember(project.id, sub.id, m)}>Remove</button>
            </div>
          ))}
        </div>

        <div className="row">
          <input placeholder="Set leader username" value={leader} onChange={e=>setLeader(e.target.value)}/>
          <button className="create-btn-popup" onClick={setLeaderNow}>Set Leader</button>
        </div>

        <div className="popup-actions">
          <button className="cancel-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
