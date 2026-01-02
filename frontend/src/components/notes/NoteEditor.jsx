import React from "react";

const NoteEditor = (props) => {
  const {
    noteEditorId,
    noteEditorTitle = "",
    setNoteEditorTitle = () => {},
    noteEditorColor = "#38bdf8",
    setNoteEditorColor = () => {},
    noteEditorEntries = [],
    hasNoteEntries = false,
    noteEntriesContainerRef,
    noteEntryInputRef,
    showNoteColorPopover = false,
    setShowNoteColorPopover = () => {},
    noteEntryDraft = "",
    setNoteEntryDraft = () => {},
    folderColors = [],
    decideMenuDirection = () => "down",
    noteEntryMenuDirection = "down",
    setNoteEntryMenuDirection = () => {},
    openNoteEntryMenuId = null,
    setOpenNoteEntryMenuId = () => {},
    handleNoteEntryKeyDown = () => {},
    handleAddManualNoteEntry = () => {},
    handleUnsaveEntry = () => {},
    handleDeleteEntry = () => {},
    handleShowEntryInChat = () => {},
    canShowInChat = false,
    clearNoteEditor = () => {},
    handleSaveNoteEditor = () => {},
  } = props || {};

  const safeEntries =
    hasNoteEntries && Array.isArray(noteEditorEntries)
      ? noteEditorEntries
      : [];

  const palette = Array.isArray(folderColors) ? folderColors : [];

  // If no note is selected → show empty state
  if (!noteEditorId) {
    return (
      <div className="note-editor-pane">
        <div className="note-editor-empty">
          <div className="empty-title">Select a note to view</div>
          <div className="empty-subtitle">
            Choose a note from the sidebar or create a new one to start saving
            prompts and responses here.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="note-editor-pane">
      {/* Title + color picker */}
      <div className="note-editor-title-row">
        <input
          type="text"
          className="modal-input note-editor-title-input"
          placeholder="Note title…"
          value={noteEditorTitle}
          onChange={(e) => setNoteEditorTitle(e.target.value)}
        />

        <button
          type="button"
          className="note-editor-color-tag"
          style={{ background: noteEditorColor }}
          onClick={(e) => {
            e.stopPropagation();
            setShowNoteColorPopover((prev) => !prev);
          }}
          title="Click to change color"
        />

        {showNoteColorPopover && (
          <div className="note-color-popover">
            <div className="note-color-popover-inner">
              {palette.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`color-option ${
                    noteEditorColor === color ? "selected" : ""
                  }`}
                  style={{ background: color }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setNoteEditorColor(color);
                    setShowNoteColorPopover(false);
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Saved entries */}
      <div
        className="note-entries-list note-entries-list-structured"
        ref={noteEntriesContainerRef}
      >
        {safeEntries.length > 0 ? (
          <>
            {safeEntries.map((entry) => {
              const isManual = entry.isManual;
              return (
                <div
                  key={entry.id}
                  className="note-entry-card structured"
                  style={{
                    position: "relative",
                    borderLeftColor: noteEditorColor,
                  }}
                >
                  <div className="note-entry-top-row">
                    <span className="note-entry-pill">
                      {isManual ? "Note block" : "Saved from chat"}
                    </span>

                    <button
                      type="button"
                      className="note-entry-menu-btn note-entry-menu-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        const dir = decideMenuDirection(e, 180);
                        setNoteEntryMenuDirection(dir);
                        setOpenNoteEntryMenuId((prev) =>
                          prev === entry.id ? null : entry.id
                        );
                      }}
                    >
                      ⋮
                    </button>

                    {openNoteEntryMenuId === entry.id && (
                      <div
                        className={`note-entry-menu note-entry-menu ${
                          noteEntryMenuDirection === "up"
                            ? "menu-up"
                            : "menu-down"
                        }`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {!isManual && canShowInChat && entry.messageId && (
                          <button
                            type="button"
                            onClick={() => {
                              handleShowEntryInChat(noteEditorId, entry);
                              setOpenNoteEntryMenuId(null);
                            }}
                          >
                            Show in Chat
                          </button>
                        )}
                        <button
                          type="button"
                          className="danger"
                          onClick={() => {
                            if (isManual) {
                              handleDeleteEntry(noteEditorId, entry.id);
                            } else {
                              handleUnsaveEntry(noteEditorId, entry.id);
                            }
                            setOpenNoteEntryMenuId(null);
                          }}
                        >
                          {isManual ? "Delete" : "Unsave"}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="note-entry-body structured">
                    {isManual ? (
                      <div className="note-entry-block">
                        <p>{entry.userText}</p>
                      </div>
                    ) : (
                      <>
                        <div className="note-entry-block user">
                          <span className="note-entry-tag">You</span>
                          <p>{entry.userText}</p>
                        </div>

                        {entry.aiText && (
                          <div className="note-entry-block ai">
                            <span className="note-entry-tag ai">AI</span>
                            <p>{entry.aiText}</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        ) : (
          <div className="note-entries-empty">
            <div className="empty-title">Start your note</div>
            <div className="empty-subtitle">
              Add your first block using the box below.
            </div>
          </div>
        )}
      </div>

      {/* Footer: input + actions */}
      <div className="note-editor-footer">
        <textarea
          ref={noteEntryInputRef}
          className="note-editor-textarea"
          placeholder="Add a note block…"
          value={noteEntryDraft}
          onChange={(e) => setNoteEntryDraft(e.target.value)}
          onKeyDown={handleNoteEntryKeyDown}
          rows={2}
        />
        <div className="note-editor-actions">
          <button
            type="button"
            className="note-editor-btn secondary"
            onClick={clearNoteEditor}
          >
            Close
          </button>
          <button
            type="button"
            className="note-editor-btn"
            onClick={handleSaveNoteEditor}
          >
            Save
          </button>
          <button
            type="button"
            className="note-editor-btn primary"
            onClick={handleAddManualNoteEntry}
            disabled={!noteEntryDraft.trim()}
          >
            Add block
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteEditor;
