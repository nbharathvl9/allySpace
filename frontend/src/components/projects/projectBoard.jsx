import React, { useMemo, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FiPlus } from "react-icons/fi";
import axios from "../../api/axiosConfig.js"
import { useProjects } from "../../context/ProjectContext";

import ProjectHeader from "./projectHeader.jsx";
import SubprojectCard from "./subProjectCard.jsx";
import CreateSubprojectModal from "../modals/CreateSubprojectModal";
import ManageMembersModal from "../modals/ManageMembersModal";
import AssignTaskModal from "../modals/AssignTaskModal";
import SubprojectHeadView from "./subProjectHeadView.jsx";
import MemberView from "./member_View.jsx";

export default function ProjectBoard() {
  const { projectId } = useParams(); // backend teamId
  const { projects, currentUser } = useProjects();

  const project = projects.find((p) => String(p.id) === String(projectId));

  const [subprojects, setSubprojects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showCreateSub, setShowCreateSub] = useState(false);
  const [manageFor, setManageFor] = useState(null);
  const [assignFor, setAssignFor] = useState(null);

  // ✅ Fetch all subteams (subprojects)
  const fetchSubprojects = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/team/${projectId}/subteams`);
      setSubprojects(res.data.subteams || []);
    } catch (err) {
      console.error("Error fetching subprojects:", err);
      setError("Failed to load subprojects. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) fetchSubprojects();
  }, [projectId]);

  // ✅ Handle delete subproject (calls backend DELETE)
  const handleDeleteSubproject = async (subId) => {
    try {
      await axios.delete(`/api/team/${projectId}/subteams/${subId}`);
      setSubprojects((prev) => prev.filter((s) => s.id !== subId));
    } catch (err) {
      console.error("Error deleting subproject:", err);
      alert("Failed to delete subproject.");
    }
  };

  if (!project)
    return (
      <div className="content">
        <h2 className="title">Project not found.</h2>
      </div>
    );

  // ✅ Determine user's role dynamically
const myRole = useMemo(() => project.role, [project]);


  const userSubproject = subprojects.find((s) => s.leader === currentUser);

  return (
    <div className="content max">
      {/* Header */}
      <ProjectHeader
        project={project}
        myRole={myRole}
        onCreateSub={() => setShowCreateSub(true)}
      />

      {/* --- HEAD View --- */}
      {myRole === "HEAD" && (
        <div className="grid-subprojects">
          {loading && <p>Loading subprojects...</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}

          {!loading && !error && subprojects.length > 0 ? (
            subprojects.map((sub) => (
              <SubprojectCard
                key={sub.id}
                project={{ id: projectId }}
                sub={sub}
                myRole={myRole}
                onManageMembers={() => setManageFor({ sub })}
                onAssign={() => setAssignFor({ sub })}
                // ✅ Connect delete button to backend
                onDelete={() => handleDeleteSubproject(sub.id)}
              />
            ))
          ) : (
            !loading &&
            !error && (
              <div className="empty-state">
                <p>No subprojects yet.</p>
              </div>
            )
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

      {/* --- SUB_HEAD View --- */}
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

      {/* --- MEMBER View --- */}
      {myRole === "MEMBER" && (
        <MemberView
          project={project}
          subproject={subprojects.find((s) =>
            s.members.includes(currentUser)
          )}
          currentUser={currentUser}
          onSendResponse={(subId, message) =>
            console.log("Response sent to Subproject Head:", message)
          }
        />
      )}

      {/* --- NO ROLE --- */}
      {myRole === "NONE" && (
        <div className="content">
          <h2 className="title">You have no access to this project.</h2>
        </div>
      )}

      {/* --- MODALS --- */}
      {showCreateSub && (
        <CreateSubprojectModal
          project={project}
          onClose={() => setShowCreateSub(false)}
          onSuccess={fetchSubprojects} // auto refresh
        />
      )}

      {manageFor && (
        <ManageMembersModal
          project={project}
          sub={manageFor.sub}
          onClose={() => setManageFor(null)}
          onSuccess={fetchSubprojects}
        />
      )}

      {assignFor && (
        <AssignTaskModal
          project={project}
          sub={assignFor.sub}
          onClose={() => setAssignFor(null)}
          onSuccess={fetchSubprojects}
        />
      )}
    </div>
  );
}
