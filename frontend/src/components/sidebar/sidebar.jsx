import React, { useMemo, useState } from "react";
import { FiX, FiPlus, FiChevronRight } from "react-icons/fi";
import { useProjects } from "../../context/ProjectContext";
import CreateProjectModal from "../modals/CreateProjectModal";
import { useNavigate } from "react-router-dom";
import "./Sidebar.css";

export default function Sidebar({ open, close }) {
  const { currentUser, getUserRoles } = useProjects();
  const [showCreate, setShowCreate] = useState(false);
  const roles = useMemo(() => getUserRoles(), [getUserRoles]);
  const navigate = useNavigate();

  const gotoTeam = (id) => {
    navigate(`/app/projects/${id}`);
    close?.();
  };

  return (
    <>
      <aside className={`sidebar ${open ? "show" : ""}`}>
        <div className="sidebar-head">
          <button className="btn-cross" onClick={close}>
            <FiX size={22} />
          </button>
          <div className="user-chip">You: <strong>@{currentUser}</strong></div>
        </div>

        <section>
          <h4>Projects (you’re Head)</h4>
          <ul>
            {roles.headTeams.length ? (
              roles.headTeams.map((t) => (
                <li key={t.id} onClick={() => gotoTeam(t.id)}>
                  <span>{t.name}</span>
                  <FiChevronRight />
                </li>
              ))
            ) : (
              <li className="empty">No projects yet.</li>
            )}
          </ul>

          <button className="create-btn" onClick={() => setShowCreate(true)}>
            <FiPlus /> Create Project
          </button>
        </section>

        <section>
          <h4>Subprojects (you’re Lead)</h4>
          <ul>
            {roles.subHeadTeams.length ? (
              roles.subHeadTeams.map(({ team, sub }) => (
                <li key={sub.id} onClick={() => gotoTeam(team.id)}>
                  {team.name} • {sub.name}
                </li>
              ))
            ) : (
              <li className="empty">You don’t lead any subprojects.</li>
            )}
          </ul>
        </section>

        <section>
          <h4>Subprojects (you’re Member)</h4>
          <ul>
            {roles.memberTeams.length ? (
              roles.memberTeams.map(({ team, sub }) => (
                <li key={sub.id} onClick={() => gotoTeam(team.id)}>
                  {team.name} • {sub.name}
                </li>
              ))
            ) : (
              <li className="empty">No subprojects as member.</li>
            )}
          </ul>
        </section>
      </aside>

      {showCreate && <CreateProjectModal onClose={() => setShowCreate(false)} />}
    </>
  );
}
