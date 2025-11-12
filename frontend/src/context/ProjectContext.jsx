import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "../api/axiosConfig.js";

const ProjectContext = createContext();
export const useProjects = () => useContext(ProjectContext);

export function ProjectProvider({ children, currentUser }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/team/my-teams");
      setProjects(res.data || []);
    } catch (err) {
      console.error("Error loading teams:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) fetchProjects();
  }, [currentUser]);

  // ✅ Role filter helper
  const getUserRoles = () => {
    const headTeams = projects.filter((p) => p.role === "HEAD");
    const subHeadTeams = projects
      .filter((p) => p.role !== "HEAD")
      .flatMap((p) =>
        p.subprojects
          .filter((s) => s.leader === currentUser)
          .map((s) => ({ team: p, sub: s }))
      );
    const memberTeams = projects
      .filter((p) => p.role !== "HEAD")
      .flatMap((p) =>
        p.subprojects
          .filter((s) => s.members.includes(currentUser))
          .map((s) => ({ team: p, sub: s }))
      );
    return { headTeams, subHeadTeams, memberTeams };
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        loading,
        currentUser,
        fetchProjects,
        getUserRoles,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}
