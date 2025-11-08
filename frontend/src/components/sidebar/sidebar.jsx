import React, { useMemo, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiX, FiPlus, FiChevronRight } from "react-icons/fi";
import { useProjects } from "../../context/ProjectContext";
import CreateProjectModal from "../modals/CreateSubprojectModal.jsx";
import "./Sidebar.css";

export default function Sidebar({ open, close }) {
  const { projects, currentUser, getUserRoles } = useProjects();
  const [showCreate, setShowCreate] = useState(false);
  const roles = useMemo(()=>getUserRoles(), [projects]);
  const navigate = useNavigate();
  const location = useLocation();

  const goto = (pid)=>{ navigate(`/app/projects/${pid}`); close?.(); };
  const isActive = (pid)=> location.pathname.includes(`/projects/${pid}`);

  return (
    <>
      <aside className={`sidebar ${open ? "show" : ""}`}>
        <div className="sidebar-head">
          <button className="btn-cross" onClick={close} aria-label="Close"><FiX size={22}/></button>
          <div className="user-chip">You: <strong>@{currentUser}</strong></div>
        </div>

        <section>
          <h4>Projects (you’re Head)</h4>
          <ul>
            {projects.filter(p=>p.head===currentUser).map(p=>(
              <li key={p.id} className={isActive(p.id)?"active":""} onClick={()=>goto(p.id)}>
                <span>{p.name}</span><FiChevronRight className="chev" />
              </li>
            ))}
            {projects.filter(p=>p.head===currentUser).length===0 && <li className="empty">No projects yet.</li>}
          </ul>
          <button className="create-btn" onClick={()=>setShowCreate(true)}>
            <FiPlus className="plus-icon"/> Create Project
          </button>
        </section>

        <section>
          <h4>Subprojects (you’re Lead)</h4>
          <ul>
            {projects.flatMap(p=>p.subprojects.map(s=>({p,s}))).filter(({s})=>s.leader===currentUser)
              .map(({p,s})=>(
                <li key={s.id} onClick={()=>goto(p.id)}>
                  <span>{p.name} • {s.name}</span>
                </li>
              ))}
          </ul>
        </section>

        <section>
          <h4>Subprojects (you’re Member)</h4>
          <ul>
            {projects.flatMap(p=>p.subprojects.map(s=>({p,s}))).filter(({s})=>s.members.includes(currentUser))
              .map(({p,s})=>(
                <li key={s.id} onClick={()=>goto(p.id)}>
                  <span>{p.name} • {s.name}</span>
                </li>
              ))}
          </ul>
        </section>
      </aside>

      {showCreate && <CreateProjectModal onClose={()=>setShowCreate(false)} />}
    </>
  );
}
