import React from "react";

const FolderList = ({
  sortedFolders,
  notes,
  activeFolder,
  selectedFolderIds,
  folderSelectionMode,
  folderMenuId,
  folderMenuDirection,
  setFolderMenuDirection,
  setFolderMenuId,
  onToggleFolderSelectItem,
  onStartFolderSelection,
  onTogglePinFolder,
  onDeleteFolder,
  onPromptRenameFolder,
  setSelectedFolderId,
  decideMenuDirection,
  darkenColor,
}) => {
  return (
    <div className="folders-section">
      <div className="section-title">Folders</div>
      <div className="folders-list">
        {sortedFolders.map((folder) => {
          const darker = darkenColor(folder.color, 0.18);
          const count = notes.filter((n) => n.folderId === folder.id).length;
          const isSelectedFolder = selectedFolderIds.includes(folder.id);

          return (
            <div
              key={folder.id}
              className={`folder-item ${
                folder.pinned ? "pinned" : ""
              } ${
                folderMenuId === folder.id ? "menu-open" : ""
              } ${
                activeFolder?.id === folder.id ? "active-folder" : ""
              }`}
              onClick={() => {
                if (folderSelectionMode) {
                  onToggleFolderSelectItem(folder.id);
                } else {
                  setSelectedFolderId(folder.id);
                }
              }}
            >
              <div className="folder-icon-3d">
                <div className="folder-back" style={{ background: darker }} />
                <div
                  className="folder-tab"
                  style={{ background: folder.color }}
                />
                <div
                  className="folder-front"
                  style={{ background: folder.color }}
                />
              </div>

              <div className="folder-details">
                <div className="folder-name-row">
                  <span className="folder-pin-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 3h10l-2 6v4l2 2H7l2-2v-4z" />
                      <path d="M12 15v6" />
                    </svg>
                  </span>
                  <div className="folder-name">{folder.name}</div>
                </div>
                <div className="folder-count">{count} notes</div>
              </div>

              <div className="folder-actions">
                {folderSelectionMode && (
                  <input
                    type="checkbox"
                    className="folder-select-checkbox"
                    checked={isSelectedFolder}
                    onChange={() => onToggleFolderSelectItem(folder.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                )}

                <button
                  type="button"
                  className="folder-action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    const dir = decideMenuDirection(e, 220);
                    setFolderMenuDirection(dir);
                    setFolderMenuId((prev) =>
                      prev === folder.id ? null : folder.id
                    );
                  }}
                >
                  ⋮
                </button>

                {folderMenuId === folder.id && (
                  <div
                    className={`chat-menu folder-menu ${
                      folderMenuDirection === "up" ? "menu-up" : "menu-down"
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => onStartFolderSelection(folder.id)}
                    >
                      Select folders
                    </button>
                    <button
                      type="button"
                      onClick={() => onTogglePinFolder(folder.id)}
                    >
                      {folder.pinned ? "Unpin folder" : "Pin folder"}
                    </button>
                    <button
                      type="button"
                      onClick={() => onPromptRenameFolder(folder)}
                    >
                      Rename
                    </button>
                    <button
                      type="button"
                      className="danger"
                      onClick={() => onDeleteFolder(folder.id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FolderList;
