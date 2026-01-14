import React, { useEffect, useRef } from "react";
import NotesList from "./NotesList";

const NotesListPanel = ({
  notesViewMode,
  activeFolder,
  notes,
  sortedNotes,
  notesSelectionMode,
  selectedNoteIds,
  onSelectNoteItem,
  onOpenNoteEditor,
  onStartNotesSelectionFromNote,
  menuNoteId,
  setMenuNoteId,
  noteMenuDirection,
  setNoteMenuDirection,
  decideMenuDirection,
  onPinNoteSingle,
  onDeleteNoteSingle,
  onOpenMoveNoteModal,
  onOpenAddNotesToFolder,
  onShowNoteInChats,
  activeChatIds,
  onCreateNoteInFolder,
}) => {
  const notesListRef = useRef(null);

  // Determine which notes to display
  const displayNotes = notesViewMode === "allNotes" 
    ? sortedNotes 
    : (activeFolder ? notes.filter(n => n.folderId === activeFolder.id) : []);

  // Determine header text
  const headerText = notesViewMode === "allNotes"
    ? `All Notes (${displayNotes.length})`
    : activeFolder
    ? `${activeFolder.name} (${displayNotes.length})`
    : "No folder selected";

  // Auto-scroll to bottom when notes change
  useEffect(() => {
    if (!notesListRef.current || displayNotes.length === 0) return;
    const el = notesListRef.current;
    el.scrollTop = el.scrollHeight;
  }, [displayNotes.length, notesViewMode, activeFolder?.id]);

  return (
    <div className="chat-panel">
      <div className="chat-header-bar">
        <div className="chat-header-left">
          <div className="chat-title">{headerText}</div>
          <div className="chat-subtitle">
            {displayNotes.length === 0
              ? notesViewMode === "allNotes"
                ? "No notes yet. Create one to get started!"
                : activeFolder
                ? `No notes in "${activeFolder.name}". Create your first note!`
                : "Select a folder or view all notes"
              : `${displayNotes.length} note${displayNotes.length !== 1 ? "s" : ""}`}
          </div>
        </div>
        {activeFolder && notesViewMode !== "allNotes" && (
          <button
            className={
              "add-notes-to-folder-btn" +
              (displayNotes.length === 0 ? " accent" : "")
            }
            onClick={() => onOpenAddNotesToFolder(activeFolder.id)}
            title="Add existing notes to this folder"
          >
            + Add Files
          </button>
        )}
      </div>

      <div className="chat-messages" ref={notesListRef}>
        {displayNotes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-title">
              {notesViewMode === "allNotes" ? "📝 No Notes Yet" : "📂 Empty Folder"}
            </div>
            <div className="empty-state-subtitle">
              {notesViewMode === "allNotes"
                ? "Create your first note to get started"
                : "Create your first note in this folder"}
            </div>
            {activeFolder && notesViewMode !== "allNotes" && (
              <button
                type="button"
                className="empty-cta"
                onClick={() =>
                  onCreateNoteInFolder
                    ? onCreateNoteInFolder(activeFolder.id)
                    : onOpenAddNotesToFolder(activeFolder.id)
                }
              >
                Create your first note
              </button>
            )}
          </div>
        ) : (
          <NotesList
            notesForSidebar={displayNotes}
            notesSelectionMode={notesSelectionMode}
            selectedNoteIds={selectedNoteIds}
            onSelectNoteItem={onSelectNoteItem}
            onOpenNoteEditor={onOpenNoteEditor}
            onStartNotesSelectionFromNote={onStartNotesSelectionFromNote}
            onShowNoteInChats={onShowNoteInChats}
            activeChatIds={activeChatIds}
            menuNoteId={menuNoteId}
            setMenuNoteId={setMenuNoteId}
            noteMenuDirection={noteMenuDirection}
            setNoteMenuDirection={setNoteMenuDirection}
            decideMenuDirection={decideMenuDirection}
            onPinNoteSingle={onPinNoteSingle}
            onDeleteNoteSingle={onDeleteNoteSingle}
            onOpenMoveNoteModal={onOpenMoveNoteModal}
            showFolderBadge={notesViewMode === "allNotes"}
          />
        )}
      </div>
    </div>
  );
};

export default NotesListPanel;
