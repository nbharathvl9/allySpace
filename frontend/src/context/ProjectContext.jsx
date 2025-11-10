import React, { createContext, useContext, useState } from "react";
import { nanoid } from "nanoid";

const ProjectContext = createContext();
export const useProjects = () => useContext(ProjectContext);

// Roles: "HEAD" (project head), "SUB_HEAD" (subproject lead), "MEMBER"
const seed=[
  {
    id: "p1",
    name: "Campus Connect",
    description: "Main portal for events and clubs.",
    head: "sam", // Sam is the Project Head
    subprojects: [
      {
        id: "sp1",
        name: "Mobile App",
        description: "Android/iOS version of the Campus Connect portal.",
        leader: "anita",
        members: ["ravi", "kim"],
        tasks: [
          {
            id: "t1",
            title: "Auth Screens",
            due: "2025-11-15",
            assignee: "ravi",
            status: "in-progress",
          },
          {
            id: "t2",
            title: "Push Notifications",
            due: "2025-11-22",
            assignee: "kim",
            status: "not-started",
          },
        ],
      },
      {
        id: "sp2",
        name: "Web Dashboard",
        description: "Admin dashboard with analytics and moderation tools.",
        leader: "rohan",
        members: ["lee"],
        tasks: [
          {
            id: "t3",
            title: "User Stats Graphs",
            due: "2025-11-18",
            assignee: "lee",
            status: "in-progress",
          },
        ],
      },
    ],
  },

  {
    id: "p2",
    name: "Smart Attendance System",
    description: "IoT and AI-powered attendance management for universities.",
    head: "anita", // Here Sam is not the project head
    subprojects: [
      {
        id: "sp1",
        name: "Face Recognition Module",
        description: "Develop and integrate real-time facial detection.",
        leader: "sam", // Sam is Subproject Head here 👇
        members: ["ravi", "tanya"],
        tasks: [
          {
            id: "t1",
            title: "Model Training",
            due: "2025-11-20",
            assignee: "ravi",
            status: "in-progress",
          },
          {
            id: "t2",
            title: "Integration with Camera Feed",
           
          }
        ]
      }
    ]
  },
  {
  id: "p3",
  name: "Smart Campus Tracker",
  description: "IoT-driven system for tracking classroom and lab usage efficiently.",
  head: "anita", // main project head
  subprojects: [
    {
      id: "sp1",
      name: "Hardware Sensors",
      description: "Arduino + ESP32 setup for room occupancy detection.",
      leader: "rohan",
      members: ["sam", "ravi"], // 👈 sam is a MEMBER here
      tasks: [
        {
          id: "t1",
          title: "Configure motion sensors",
          due: "2025-11-22",
          assignee: "sam",
          status: "assigned",
          response: ""
        },
        {
          id: "t2",
          title: "Wire up ESP32 to main board",
          due: "2025-11-25",
          assignee: "ravi",
          status: "assigned",
          response: ""
        }
      ]
    },
    {
      id: "sp2",
      name: "Data Dashboard",
      description: "Web UI to visualize occupancy and alerts.",
      leader: "arjun",
      members: ["lee", "kim"],
      tasks: [
        {
          id: "t3",
          title: "Build live charts",
          due: "2025-11-20",
          assignee: "lee",
          status: "in-progress",
          response: "Data fetching module halfway done."
        }
      ]
    }
  ]
}

]

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
