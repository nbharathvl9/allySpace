import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  FiPlus
} from "react-icons/fi";
import { useProjects } from "../../context/ProjectContext";
import ProjectHeader from "./projectHeader.jsx";
import SubprojectCard from "./subProjectCard.jsx";
import CreateSubprojectModal from "../modals/CreateSubprojectModal";
import ManageMembersModal from "../modals/ManageMembersModal";
import AssignTaskModal from "../modals/AssignTaskModal";
import SubprojectHeadView from "./subProjectHeadView.jsx";
import MemberView from "./member_View.jsx";

export default function ProjectBoard() {
  const { projectId } = useParams();
  const { projects, currentUser } = useProjects();

  // Find the current project
  const project = projects.find((p) => String(p.id) === String(projectId));

  if (!project)
    return (
      <div className="content">
        <h2 className="title">Project not found.</h2>
      </div>
    );

  // Local states for modals
  const [showCreateSub, setShowCreateSub] = useState(false);
  const [manageFor, setManageFor] = useState(null);
  const [assignFor, setAssignFor] = useState(null);

  // Determine user's role
  const myRole = useMemo(() => {
    if (project.head === currentUser) return "HEAD";
    if (project.subprojects?.find((s) => s.leader === currentUser)) return "SUB_HEAD";
    if (project.subprojects?.find((s) => s.members.includes(currentUser))) return "MEMBER";
    return "NONE";
  }, [project, currentUser]);

  const userSubproject = project.subprojects?.find((s) => s.leader === currentUser);

  return (
    <div className="content max">

      {/* Header */}
      <ProjectHeader
        project={project}
        myRole={myRole}
        onCreateSub={() => setShowCreateSub(true)}
      />

      {/* --- Project Head View --- */}
      {myRole === "HEAD" && (
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
          <div
            className="sub-card add-card"
            onClick={() => setShowCreateSub(true)}
          >
            <div className="add-inner">
              <FiPlus size={36} />
              <p>Add Subproject</p>
            </div>
          </div>
        </div>
      )}

      {/* --- Subproject Head View --- */}
      {myRole === "SUB_HEAD" && userSubproject && (
        <div className="subproject-head-section">
          <SubprojectHeadView
            project={project}
            subproject={userSubproject}
            currentUser={currentUser}
            onSendResponse={(subId, message) => {
              console.log("Response sent to Project Head:", message);
            }}
          />
        </div>
      )}

      {/* --- Member View (Placeholder for now) --- */}
    
      {myRole === "MEMBER" && (
    <MemberView
      project={project}
      subproject={project.subprojects.find((s) =>
        s.members.includes(currentUser)
      )}
      currentUser={currentUser}
      onSendResponse={(subId, message) =>
        console.log("Response sent to Subproject Head:", message)
      }
    />
  )}

      {/* --- No Role --- */}
      {myRole === "NONE" && (
        <div className="content">
          <h2 className="title">You have no access to this project.</h2>
        </div>
      )}

      {/* --- Modals --- */}
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
