import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  FiUserPlus,
  FiTrash2,
  FiUserCheck,
  FiUsers,
  FiClipboard,
  FiCalendar,
  FiPlus,
} from "react-icons/fi";
import { useProjects } from "../../context/ProjectContext";
import ProjectHeader from "./projectHeader.jsx";
import SubprojectCard from "./subProjectCard.jsx";
import CreateSubprojectModal from "../modals/CreateSubprojectModal";
import ManageMembersModal from "../modals/ManageMembersModal";
import AssignTaskModal from "../modals/AssignTaskModal";

export default function ProjectBoard() {
  const { projectId } = useParams();
  const { projects, currentUser } = useProjects();

  // 🔹 Handle ID type mismatch (string vs number)
  const project = projects.find((p) => String(p.id) === String(projectId));

  // 🔹 If no project found
  if (!project)
    return (
      <div className="content">
        <h2 className="title">Project not found.</h2>
      </div>
    );

  // 🔹 Role checks
  const [showCreateSub, setShowCreateSub] = useState(false);
  const [manageFor, setManageFor] = useState(null);
  const [assignFor, setAssignFor] = useState(null);

  const myRole = useMemo(() => {
    if (!project) return "NONE";
    if (project.head === currentUser) return "HEAD";

    const asLead = project.subprojects?.find(
      (s) => s.leader === currentUser
    );
    if (asLead) return "SUB_HEAD";

    const asMem = project.subprojects?.find((s) =>
      s.members.includes(currentUser)
    );
    if (asMem) return "MEMBER";

    return "NONE";
  }, [project, currentUser]);

  // 🔹 Render layout
  return (
    <div className="content max">
      {/* Header Section */}
      <ProjectHeader
        project={project}
        myRole={myRole}
        onCreateSub={() => setShowCreateSub(true)}
      />

      {/* Subproject Grid */}
      <div className="grid-subprojects">
        {project.subprojects?.length > 0 ? (
          project.subprojects.map((sub) => (
            <SubprojectCard
              key={sub.id}
              project={project}
              sub={sub}
              myRole={myRole}
              onManageMembers={() => setManageFor({ sub })}
              onAssign={() => setAssignFor({ sub })}
            />
          ))
        ) : (
          <div className="empty-state">
            <p>No subprojects yet.</p>
          </div>
        )}

        {/* Add Subproject Button */}
        {myRole === "HEAD" && (
          <div
            className="sub-card add-card"
            onClick={() => setShowCreateSub(true)}
          >
            <div className="add-inner">
              <FiPlus size={36} />
              <p>Add Subproject</p>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateSub && (
        <CreateSubprojectModal
          project={project}
          onClose={() => setShowCreateSub(false)}
        />
      )}

      {manageFor && (
        <ManageMembersModal
          project={project}
          sub={manageFor.sub}
          onClose={() => setManageFor(null)}
        />
      )}

      {assignFor && (
        <AssignTaskModal
          project={project}
          sub={assignFor.sub}
          onClose={() => setAssignFor(null)}
        />
      )}
    </div>
  );
}
