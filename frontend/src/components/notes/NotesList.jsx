import React from "react";

const NotesList = ({
  notesForSidebar,
  notesSelectionMode,
  selectedNoteIds,
  onSelectNoteItem,
  onOpenNoteEditor,
  onStartNotesSelectionFromNote,
  onShowNoteInChats,
  activeChatIds = new Set(),
  onOpenMoveNoteModal,
  onPinNoteSingle,
  onDeleteNoteSingle,
  menuNoteId,
  setMenuNoteId,
  noteMenuDirection,
  setNoteMenuDirection,
  decideMenuDirection,
  showFolderBadge = false,
  folders = [],
}) => {
  // Sidebar shows only titles; no folder badges or previews needed

  return (
    <>
      <div className="section-title" style={{ marginTop: 24 }}>
        Notes
      </div>

      <div className="notes-grid">
        {notesForSidebar.map((note) => {
          // Keep menu/handlers intact; render only single-line title in the card body
          const chatId = note.chatId ?? note.sourceChatId;
          const messageId = note.messageId ?? note.sourceMessageId;
          const chatExists = activeChatIds?.has
            ? activeChatIds.has(chatId)
            : Array.isArray(activeChatIds)
            ? activeChatIds.includes(chatId)
            : false;
          const canFlag = note.canShowInChat ?? note.can_show_in_chat;
          const canShowInChat = Boolean(canFlag && chatId && messageId && chatExists);
          return (
          <div
            key={note.id}
            className={`note-card ${
              note.pinned ? "pinned" : ""
            } ${menuNoteId === note.id ? "menu-open" : ""}`}
            onClick={(e) => {
              if (
                e.target.classList.contains("note-menu-btn") ||
                e.target.classList.contains("note-select-checkbox")
              ) {
                return;
              }
              if (notesSelectionMode) {
                onSelectNoteItem(note.id);
              } else {
                onOpenNoteEditor(note);
              }
            }}
          >
            <div className="note-card-header">
              <div
                className="note-color-dot"
                style={{ background: note.color || "#38bdf8" }}
              />
              <div className="note-title-row">
                <span className="note-pin-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 3h10l-2 6v4l2 2H7l2-2v-4z" />
                    <path d="M12 15v6" />
                  </svg>
                </span>
                <div className="note-title">{note.title}</div>
              </div>

              <div className="note-card-right">
                {notesSelectionMode && (
                  <input
                    type="checkbox"
                    className="note-select-checkbox"
                    checked={selectedNoteIds.includes(note.id)}
                    onChange={() => onSelectNoteItem(note.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                )}

                <button
                  type="button"
                  className="note-menu-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    const dir = decideMenuDirection(e, 220);
                    setNoteMenuDirection(dir);
                    setMenuNoteId((prev) =>
                      prev === note.id ? null : note.id
                    );
                  }}
                >
                  ⋮
                </button>
              </div>
            </div>

            {/* Preview and folder badges removed for minimal sidebar */}

            {menuNoteId === note.id && (
              <div
                className={`note-menu ${
                  noteMenuDirection === "up" ? "menu-up" : "menu-down"
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                {canShowInChat && (
                  <button
                    type="button"
                    onClick={() => {
                      onShowNoteInChats(note);
                      setMenuNoteId(null);
                    }}
                  >
                    Show in Chat
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    onOpenMoveNoteModal(note);
                    setMenuNoteId(null);
                  }}
                >
                  Move to folder
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onStartNotesSelectionFromNote(note.id);
                    setMenuNoteId(null);
                  }}
                >
                  Select notes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onPinNoteSingle(note.id);
                    setMenuNoteId(null);
                  }}
                >
                  {note.pinned ? "Unpin note" : "Pin note"}
                </button>
                <button
                  type="button"
                  className="danger"
                  onClick={() => {
                    onDeleteNoteSingle(note.id);
                    setMenuNoteId(null);
                  }}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
          );
        })}
      </div>
    </>
  );
};

export default NotesList;
