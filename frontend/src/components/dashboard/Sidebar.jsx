import React from "react";
import FolderList from "../notes/FolderList";
import NotesList from "../notes/NotesList";

const Sidebar = ({
  activeTab,
  sidebarExpanded,
  onToggleSidebar,

  // chats
  sortedChats,
  activeChat,
  selectionMode,
  selectedChatIds,
  onSelectAllChats,
  onClearChatSelection,
  onNewChat,
  onSelectChatItem,
  onStartSelectionFromChat,
  onCancelChatSelection,
  onBulkPin,
  onBulkUnpin,
  onBulkDelete,
  onPinSingle,
  onDeleteSingleChat,
  onOpenRenameModal,
  menuChatId,
  setMenuChatId,
  chatMenuDirection,
  setChatMenuDirection,
  decideMenuDirection,

  // folders + notes
  sortedFolders,
  sortedNotes,
  activeChatIds,
  notesForSidebar,
  folders,
  notes,
  activeFolder,
  selectedFolderId,
  setSelectedFolderId,
  folderSelectionMode,
  selectedFolderIds,
  onCreateFolderClick,
  onCreateNoteClick,
  onStartFolderSelection,
  onToggleFolderSelectItem,
  onFoldersBulkPin,
  onFoldersBulkUnpin,
  onFoldersBulkDelete,
  onSelectAllFolders,
  onClearFolderSelection,
  onCancelFolderSelection,
  folderMenuId,
  setFolderMenuId,
  folderMenuDirection,
  setFolderMenuDirection,
  onTogglePinFolder,
  onDeleteFolder,
  onPromptRenameFolder,

  // notes selection
  notesSelectionMode,
  selectedNoteIds,
  onSelectAllNotes,
  onClearNoteSelection,
  onCancelNotesSelection,
  onNotesBulkPin,
  onNotesBulkUnpin,
  onNotesBulkDelete,
  onNotesBulkMove,
  onSelectNoteItem,
  onStartNotesSelectionFromNote,

  // NOTE FIX — these two props were missing
  onPinNoteSingle,
  onDeleteNoteSingle,

  // note menus
  menuNoteId,
  setMenuNoteId,
  noteMenuDirection,
  setNoteMenuDirection,
  onOpenNoteEditor,
  onShowNoteInChats,
  onOpenMoveNoteModal,

  // notes view mode
  notesViewMode,
  setNotesViewMode,

  darkenColor,
}) => {
  return (
    <aside className={`sidebar ${sidebarExpanded ? "expanded" : "collapsed"}`}>
      <button
        type="button"
        className="sidebar-toggle"
        onClick={onToggleSidebar}
        aria-label={sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
      >
        <svg
          aria-hidden="true"
          focusable="false"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3.5" y="3.5" width="17" height="17" rx="3" ry="3" />
          <line x1="12" y1="4" x2="12" y2="20" />
          <line x1="6.5" y1="8" x2="10" y2="8" />
          <line x1="6.5" y1="12" x2="10" y2="12" />
          <line x1="6.5" y1="16" x2="10" y2="16" />
        </svg>
      </button>

      <div className="sidebar-content">
        
        {/* ---------------------- CHAT SIDEBAR ---------------------- */}
        {activeTab === "chats" && (
          <>
            <button className="new-item-btn" type="button" onClick={onNewChat}>
              New Chat
            </button>

            {selectionMode && (
              <div className="selection-toolbar">
                <div className="selection-actions">
                  <span>
                    {selectedChatIds.length} chat
                    {selectedChatIds.length !== 1 ? "s" : ""} selected
                  </span>
                  <button type="button" onClick={onSelectAllChats}>Select all</button>
                  <button type="button" onClick={onClearChatSelection}>Clear</button>
                  <button type="button" onClick={onBulkPin}>Pin</button>
                  <button type="button" onClick={onBulkUnpin}>Unpin</button>
                  <button type="button" className="danger" onClick={onBulkDelete}>
                    Delete
                  </button>
                </div>
                <div className="selection-cancel">
                  <button type="button" onClick={onCancelChatSelection}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div id="chats-list">
              {sortedChats.map((chat) => (
                <div
                  key={chat.id}
                  className={`chat-item 
                    ${chat.pinned ? "pinned" : ""} 
                    ${activeChat?.id === chat.id ? "active" : ""} 
                    ${menuChatId === chat.id ? "menu-open" : ""}`}
                  onClick={() => onSelectChatItem(chat.id)}
                >
                  <div className="chat-item-header">
                    <div className="chat-item-title-row">
                      <span className="chat-pin-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M7 3h10l-2 6v4l2 2H7l2-2v-4z" />
                          <path d="M12 15v6" />
                        </svg>
                      </span>
                      <div className="chat-item-title">{chat.title}</div>
                    </div>

                    <div className="chat-item-right">
                      {selectionMode && (
                        <input
                          type="checkbox"
                          className="chat-select-checkbox"
                          checked={selectedChatIds.includes(chat.id)}
                          onChange={() => onSelectChatItem(chat.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}

                      <button
                        type="button"
                        className="chat-menu-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          const dir = decideMenuDirection(e, 220);
                          setChatMenuDirection(dir);
                          setMenuChatId((prev) =>
                            prev === chat.id ? null : chat.id
                          );
                        }}
                      >
                        ⋮
                      </button>
                    </div>
                  </div>

                  <div className="chat-item-preview">{chat.preview}</div>

                  {menuChatId === chat.id && (
                    <div
                      className={`chat-menu ${
                        chatMenuDirection === "up" ? "menu-up" : "menu-down"
                      }`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => onStartSelectionFromChat(chat.id)}
                      >
                        Select chats
                      </button>
                      <button
                        type="button"
                        onClick={() => onPinSingle(chat.id)}
                      >
                        {chat.pinned ? "Unpin chat" : "Pin chat"}
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenRenameModal(chat)}
                      >
                        Rename
                      </button>
                      <button
                        type="button"
                        className="danger"
                        onClick={() => onDeleteSingleChat(chat.id)}
                      >
                        Delete chat
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* ---------------------- NOTES SIDEBAR ---------------------- */}
        {activeTab === "notes" && (
          <>
            <button className="new-item-btn" type="button" onClick={onCreateFolderClick}>
              Add Folder
            </button>
            <button
              className="new-item-btn secondary"
              type="button"
              onClick={onCreateNoteClick}
            >
              Add Note
            </button>

            {/* View Mode Toggle */}
            <div className="notes-view-toggle">
              <button
                type="button"
                className={`toggle-btn ${notesViewMode === "folders" ? "active" : ""}`}
                onClick={() => setNotesViewMode("folders")}
              >
                Folders
              </button>
              <button
                type="button"
                className={`toggle-btn ${notesViewMode === "allNotes" ? "active" : ""}`}
                onClick={() => setNotesViewMode("allNotes")}
              >
                All Notes
              </button>
            </div>

            {/* Folder selection mode */}
            {folderSelectionMode && (
              <div className="selection-toolbar">
                <div className="selection-actions">
                  <span>
                    {selectedFolderIds.length} folder
                    {selectedFolderIds.length !== 1 ? "s" : ""} selected
                  </span>
                  <button type="button" onClick={onSelectAllFolders}>Select all</button>
                  <button type="button" onClick={onClearFolderSelection}>Clear</button>
                  <button type="button" onClick={onFoldersBulkPin}>Pin</button>
                  <button type="button" onClick={onFoldersBulkUnpin}>Unpin</button>
                  <button type="button" className="danger" onClick={onFoldersBulkDelete}>
                    Delete
                  </button>
                  <button type="button" onClick={onCancelFolderSelection}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Notes selection mode */}
            {notesSelectionMode && (
              <div className="selection-toolbar">
                <div className="selection-actions">
                  <span>
                    {selectedNoteIds.length} note
                    {selectedNoteIds.length !== 1 ? "s" : ""} selected
                  </span>
                  <button type="button" onClick={onSelectAllNotes}>Select all</button>
                  <button type="button" onClick={onClearNoteSelection}>Clear</button>
                  <button type="button" onClick={onNotesBulkPin}>Pin</button>
                  <button type="button" onClick={onNotesBulkUnpin}>Unpin</button>
                  <button type="button" onClick={onNotesBulkMove}>Move to folder</button>
                  <button type="button" className="danger" onClick={onNotesBulkDelete}>
                    Delete
                  </button>
                </div>
                <div className="selection-cancel">
                  <button type="button" onClick={onCancelNotesSelection}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Folders View - Only Shows Folders */}
            {notesViewMode === "folders" && (
              <>
                {/* Folder List */}
                <FolderList
                  sortedFolders={sortedFolders}
                  notes={notes}
                  activeFolder={activeFolder}
                  selectedFolderIds={selectedFolderIds}
                  folderSelectionMode={folderSelectionMode}
                  folderMenuId={folderMenuId}
                  folderMenuDirection={folderMenuDirection}
                  setFolderMenuDirection={setFolderMenuDirection}
                  setFolderMenuId={setFolderMenuId}
                  onToggleFolderSelectItem={onToggleFolderSelectItem}
                  onStartFolderSelection={onStartFolderSelection}
                  onTogglePinFolder={onTogglePinFolder}
                  onDeleteFolder={onDeleteFolder}
                  onPromptRenameFolder={onPromptRenameFolder}
                  setSelectedFolderId={setSelectedFolderId}
                  decideMenuDirection={decideMenuDirection}
                  darkenColor={darkenColor}
                />
              </>
            )}

            {/* All Notes View */}
            {notesViewMode === "allNotes" && (
              <>
                <div className="section-title" style={{ marginTop: 12 }}>
                  All Notes ({sortedNotes.length})
                </div>
                <NotesList
                  notesForSidebar={sortedNotes}
                  notesSelectionMode={notesSelectionMode}
                  selectedNoteIds={selectedNoteIds}
                  onSelectNoteItem={onSelectNoteItem}
                  onOpenNoteEditor={onOpenNoteEditor}
                  onStartNotesSelectionFromNote={onStartNotesSelectionFromNote}
                  onShowNoteInChats={onShowNoteInChats}
                  activeChatIds={activeChatIds}
                  onOpenMoveNoteModal={onOpenMoveNoteModal}

                  // FIXED PROPS
                  onPinNoteSingle={onPinNoteSingle}
                  onDeleteNoteSingle={onDeleteNoteSingle}

                  menuNoteId={menuNoteId}
                  setMenuNoteId={setMenuNoteId}
                  noteMenuDirection={noteMenuDirection}
                  setNoteMenuDirection={setNoteMenuDirection}
                  decideMenuDirection={decideMenuDirection}
                />
              </>
            )}
          </>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
