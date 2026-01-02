import React from "react";
import NotesHeader from "./NotesHeader";
import NoteEditor from "./NoteEditor";

const NotesPanel = ({
  activeFolder,
  noteEditorId,
  noteEditorTitle,
  setNoteEditorTitle,
  noteEditorColor,
  setNoteEditorColor,
  noteEditorEntries,
  hasNoteEntries,
  noteEntriesContainerRef,
  noteEntryInputRef,
  showNoteColorPopover,
  setShowNoteColorPopover,
  noteEntryDraft,
  setNoteEntryDraft,
  folderColors,
  decideMenuDirection,
  noteEntryMenuDirection,
  setNoteEntryMenuDirection,
  openNoteEntryMenuId,
  setOpenNoteEntryMenuId,
  handleNoteEntryKeyDown,
  handleAddManualNoteEntry,
  handleUnsaveEntry,
  handleDeleteEntry,
  handleShowEntryInChat,
  noteEditorCanShowInChat = false,
  clearNoteEditor,
  handleSaveNoteEditor,
}) => {
  return (
    <div className="chat-panel">
      <NotesHeader activeFolder={activeFolder} />

      <div className="chat-messages">
        <NoteEditor
          noteEditorId={noteEditorId}
          noteEditorTitle={noteEditorTitle}
          setNoteEditorTitle={setNoteEditorTitle}
          noteEditorColor={noteEditorColor}
          setNoteEditorColor={setNoteEditorColor}
          noteEditorEntries={noteEditorEntries}
          hasNoteEntries={hasNoteEntries}
          noteEntriesContainerRef={noteEntriesContainerRef}
          noteEntryInputRef={noteEntryInputRef}
          showNoteColorPopover={showNoteColorPopover}
          setShowNoteColorPopover={setShowNoteColorPopover}
          noteEntryDraft={noteEntryDraft}
          setNoteEntryDraft={setNoteEntryDraft}
          folderColors={folderColors}
          decideMenuDirection={decideMenuDirection}
          noteEntryMenuDirection={noteEntryMenuDirection}
          setNoteEntryMenuDirection={setNoteEntryMenuDirection}
          openNoteEntryMenuId={openNoteEntryMenuId}
          setOpenNoteEntryMenuId={setOpenNoteEntryMenuId}
          handleNoteEntryKeyDown={handleNoteEntryKeyDown}
          handleAddManualNoteEntry={handleAddManualNoteEntry}
          handleUnsaveEntry={handleUnsaveEntry}
          handleDeleteEntry={handleDeleteEntry}
          handleShowEntryInChat={handleShowEntryInChat}
          canShowInChat={noteEditorCanShowInChat}
          clearNoteEditor={clearNoteEditor}
          handleSaveNoteEditor={handleSaveNoteEditor}
        />
      </div>
    </div>
  );
};

export default NotesPanel;
