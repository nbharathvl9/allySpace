import React, { useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import axios from "../../api/axiosConfig.js"

export default function CreateSubprojectModal({ project, onClose }){
  const { createSubproject } = useProjects();
  const [form, setForm] = useState({ name:"", description:"", leader:"" });

  const submit = async () => {
  if (!form.name.trim()) return;
  try {
    await axios.post(`/api/team/${project.id}/subteams`, {
      name: form.name,
      description: form.description,
    });
    alert("Subproject created!");
    onSuccess?.(); // refresh list
    onClose();
  } catch (err) {
    console.error("Error creating subproject:", err);
    alert(err?.response?.data?.message || "Failed to create subproject.");
  }
};


  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-card" onClick={e=>e.stopPropagation()}>
        <h3>Create Subproject</h3>
        <input placeholder="Subproject name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
        <input placeholder="Leader username (optional)" value={form.leader} onChange={e=>setForm({...form, leader:e.target.value})}/>
        <textarea rows={3} placeholder="Description" value={form.description} onChange={e=>setForm({...form, description:e.target.value})}/>
        <div className="popup-actions">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button className="create-btn-popup" onClick={submit}>Create</button>
        </div>
      </div>
    </div>
  );
}
