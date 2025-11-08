import React, { useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useNavigate } from "react-router-dom";

export default function CreateProjectModal({ onClose }){
  const { createProject } = useProjects();
  const [form, setForm] = useState({name:"", description:""});
  const navigate = useNavigate();

  const submit = ()=>{
    if(!form.name.trim()) return;
    const id = createProject(form);
    onClose();
    navigate(`/app/projects/${id}`);
  };

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-card" onClick={e=>e.stopPropagation()}>
        <h3>Create Project</h3>
        <input placeholder="Project name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
        <textarea rows={3} placeholder="Description" value={form.description} onChange={e=>setForm({...form, description:e.target.value})}/>
        <div className="popup-actions">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button className="create-btn-popup" onClick={submit}>Create</button>
        </div>
      </div>
    </div>
  );
}
