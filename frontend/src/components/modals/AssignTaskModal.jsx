import React, { useState } from "react";
import { useProjects } from "../../context/ProjectContext";

export default function AssignTaskModal({ project, sub, onClose }){
  const { assignTask } = useProjects();
  const [form, setForm] = useState({ title:"", due:"", assignee:"" });

  const submit = ()=>{
    if(!form.title.trim() || !form.assignee.trim()) return;
    assignTask(project.id, sub.id, form);
    onClose();
  };

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-card" onClick={e=>e.stopPropagation()}>
        <h3>Assign Task • {sub.name}</h3>
        <input placeholder="Task title" value={form.title} onChange={e=>setForm({...form, title:e.target.value})}/>
        <input type="date" value={form.due} onChange={e=>setForm({...form, due:e.target.value})}/>
        <input placeholder="Assignee username" value={form.assignee} onChange={e=>setForm({...form, assignee:e.target.value})}/>
        <div className="popup-actions">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button className="create-btn-popup" onClick={submit}>Assign</button>
        </div>
      </div>
    </div>
  );
}
