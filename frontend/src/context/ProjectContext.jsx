import React, { createContext, useContext, useState } from "react";
import { nanoid } from "nanoid";

const ProjectContext = createContext();
export const useProjects = () => useContext(ProjectContext);

// Roles: "HEAD" (project head), "SUB_HEAD" (subproject lead), "MEMBER"
const seed = [
  {
    id: "p1",
    name: "Campus Connect",
    description: "Main portal for events and clubs.",
    head: "sam",                     // username of project head
    subprojects: [
      {
        id: "sp1",
        name: "Mobile App",
        description: "Android/iOS",
        leader: "anita",
        members: ["ravi","kim"],
        tasks: [
          { id:"t1", title:"Auth screens", due:"2025-11-15", assignee:"ravi", status:"in-progress" }
        ]
      },
      {
        id: "sp2",
        name: "Web Dashboard",
        description: "Admin + Analytics",
        leader: "rohan",
        members: ["lee"],
        tasks: []
      }
    ]
  }
];

export function ProjectProvider({ children }){
  const [projects, setProjects] = useState(seed);
  const currentUser = "sam"; // TODO: wire to auth later

  // CRUD: Projects
  const createProject = ({name, description})=>{
    const id = nanoid();
    setProjects(prev=>[...prev, { id, name, description, head: currentUser, subprojects: [] }]);
    return id;
  };

  // CRUD: Subprojects
  const createSubproject = (projectId, {name, description, leader})=>{
    setProjects(prev => prev.map(p=>{
      if(p.id!==projectId) return p;
      const sp = { id:nanoid(), name, description, leader, members:[], tasks:[] };
      return { ...p, subprojects:[...p.subprojects, sp] };
    }));
  };

  const deleteSubproject = (projectId, subId)=>{
    setProjects(prev=>prev.map(p=>{
      if(p.id!==projectId) return p;
      return { ...p, subprojects: p.subprojects.filter(s=>s.id!==subId) };
    }));
  };

  // Members
  const addMember = (projectId, subId, username)=>{
    setProjects(prev=>prev.map(p=>{
      if(p.id!==projectId) return p;
      return {
        ...p,
        subprojects: p.subprojects.map(s=>{
          if(s.id!==subId) return s;
          if(!s.members.includes(username)) s.members = [...s.members, username];
          return {...s};
        })
      };
    }));
  };
  const removeMember = (projectId, subId, username)=>{
    setProjects(prev=>prev.map(p=>{
      if(p.id!==projectId) return p;
      return {
        ...p,
        subprojects: p.subprojects.map(s=>{
          if(s.id!==subId) return s;
          return {...s, members: s.members.filter(m=>m!==username)};
        })
      };
    }));
  };

  // Assign / update leader
  const setSubLeader = (projectId, subId, leader)=>{
    setProjects(prev=>prev.map(p=>{
      if(p.id!==projectId) return p;
      return {
        ...p,
        subprojects: p.subprojects.map(s=> s.id===subId ? {...s, leader} : s)
      };
    }));
  };

  // Tasks
  const assignTask = (projectId, subId, {title, due, assignee})=>{
    setProjects(prev=>prev.map(p=>{
      if(p.id!==projectId) return p;
      return {
        ...p,
        subprojects: p.subprojects.map(s=>{
          if(s.id!==subId) return s;
          return {...s, tasks:[...s.tasks, {id:nanoid(), title, due, assignee, status:"assigned"}]};
        })
      };
    }));
  };
  const updateTaskStatus = (projectId, subId, taskId, status)=>{
    setProjects(prev=>prev.map(p=>{
      if(p.id!==projectId) return p;
      return {
        ...p,
        subprojects: p.subprojects.map(s=>{
          if(s.id!==subId) return s;
          return {...s, tasks: s.tasks.map(t=> t.id===taskId ? {...t, status} : t)};
        })
      };
    }));
  };

  // Role helpers for current user
  const getUserRoles = ()=>{
    const roles = { headOf:[], subHeadOf:[], memberOf:[] };
    projects.forEach(p=>{
      if(p.head===currentUser) roles.headOf.push(p.id);
      p.subprojects.forEach(s=>{
        if(s.leader===currentUser) roles.subHeadOf.push({projectId:p.id, subId:s.id});
        if(s.members.includes(currentUser)) roles.memberOf.push({projectId:p.id, subId:s.id});
      });
    });
    return roles;
  };

  return (
    <ProjectContext.Provider value={{
      projects, setProjects, currentUser,
      createProject, createSubproject, deleteSubproject,
      addMember, removeMember, setSubLeader,
      assignTask, updateTaskStatus, getUserRoles
    }}>
      {children}
    </ProjectContext.Provider>
  );
}
