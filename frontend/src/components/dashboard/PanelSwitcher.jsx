import React from "react";

const PanelSwitcher = ({
  activeTab,
  onTabChange,
  sidebarOpen,
  onToggleSidebar,
}) => {
  return (
    <div className="mode-tabs-row">
      <button
        className="menu-toggle"
        type="button"
        onClick={onToggleSidebar}
      >
        <span />
        <span />
        <span />
      </button>

      <div className="mode-tabs-group">
        <button
          type="button"
          className={`mode-tab ${activeTab === "chats" ? "active" : ""}`}
          onClick={() => onTabChange("chats")}
        >
          AI Chats
        </button>
        <button
          type="button"
          className={`mode-tab ${activeTab === "notes" ? "active" : ""}`}
          onClick={() => onTabChange("notes")}
        >
          Notes
        </button>
      </div>
    </div>
  );
};

export default PanelSwitcher;
