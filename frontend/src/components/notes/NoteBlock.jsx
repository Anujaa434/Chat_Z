import React from "react";

const NoteBlock = ({ label, variant = "default", children }) => {
  return (
    <div className={`note-entry-block ${variant}`}>
      {label && (
        <span className={`note-entry-tag ${variant === "ai" ? "ai" : ""}`}>
          {label}
        </span>
      )}
      <p>{children}</p>
    </div>
  );
};

export default NoteBlock;
