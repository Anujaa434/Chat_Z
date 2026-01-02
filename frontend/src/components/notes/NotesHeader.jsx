import React from "react";

const NotesHeader = ({ activeFolder }) => {
  const hasFolder = !!activeFolder;

  return (
    <div className="chat-header-bar">
      <div className="chat-header-left">
        <div className="chat-title">
          {hasFolder ? `Folder: ${activeFolder.name}` : "Notes"}
        </div>
        <div className="chat-subtitle">
          {hasFolder
            ? "Showing notes inside this folder."
            : "Select a note from the left sidebar or create a new one."}
        </div>
      </div>
    </div>
  );
};

export default NotesHeader;
