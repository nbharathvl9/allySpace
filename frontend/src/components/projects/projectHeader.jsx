import React from "react";

export default function 
ProjectHeader({ project, myRole }) {
  return (
    <div className="proj-header">
      <div>
        <h2 className="title">{project.name}</h2>
        <p className="subtitle">{project.description}</p>
        <div className="badges">
          <span className="badge">Head: @{project.head}</span>
          <span className={`badge role ${myRole.toLowerCase()}`}>
            You: {myRole.replace("_", " ")}
          </span>
        </div>
      </div>
    </div>
  );
}
