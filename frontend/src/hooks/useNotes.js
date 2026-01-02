import { useState, useEffect, useMemo } from "react";
import {
  initNotesApiAuth,
  fetchNotes as apiFetchNotes,
  createNote as apiCreateNote,
  updateNote as apiUpdateNote,
  deleteNote as apiDeleteNote,
  togglePinNote as apiTogglePinNote,
} from "../api/notes";
import { buildPreview, rebuildNoteContentFromEntries, parseEntriesFromContent } from "../utils/noteHelpers";

/**
 * Custom hook for managing notes and note operations
 */
export function useNotes(token) {
  const [notes, setNotes] = useState([]);
  const [noteEditorId, setNoteEditorId] = useState(null);
  const [noteEditorTitle, setNoteEditorTitle] = useState("");
  const [noteEditorContent, setNoteEditorContent] = useState("");
  const [noteEditorColor, setNoteEditorColor] = useState("#06B6D4");
  const [noteEditorEntries, setNoteEditorEntries] = useState([]);
  const [noteEntryDraft, setNoteEntryDraft] = useState("");

  // Initialize API auth when token changes
  useEffect(() => {
    if (token) {
      initNotesApiAuth(token);
      loadNotes();
    }
  }, [token]);

  // Load notes from API
  const loadNotes = async () => {
    try {
      const rows = await apiFetchNotes();
      const mapped = rows.map((n) => {
        const chatId = n.source_chat_id ?? n.chat_id ?? null;
        const messageId = n.source_message_id ?? n.message_id ?? null;
        const entries = parseEntriesFromContent(n.content || "");
        return {
          id: n.id,
          title: n.title || "Untitled Note",
          content: n.content || "",
          preview: buildPreview(n.content || n.title),
          folderId: n.note_folder_id || null,
          color: n.color || "#06B6D4",
          pinned: !!n.pinned,
          chatId,
          messageId,
          canShowInChat: !!(n.can_show_in_chat ?? n.canShowInChat),
          entries,
        };
      });
      setNotes(mapped);
    } catch (err) {
      console.error("Failed to load notes:", err);
    }
  };

  // Create a new note
  const createNote = async ({ title, content = "", folderId = null, color = "#06B6D4", chatId = null, messageId = null }) => {
    try {
      const dbNote = await apiCreateNote({ title, content, folderId, color, chatId, messageId });
      const sourceChatId = dbNote.source_chat_id ?? dbNote.chat_id ?? chatId;
      const sourceMessageId = dbNote.source_message_id ?? dbNote.message_id ?? messageId;
      const newNote = {
        id: dbNote.id,
        title: dbNote.title || title,
        content: dbNote.content || content,
        preview: buildPreview(dbNote.content || title),
        folderId: dbNote.note_folder_id,
        color: dbNote.color || color,
        pinned: !!dbNote.pinned,
        chatId: sourceChatId,
        messageId: sourceMessageId,
        canShowInChat: !!(dbNote.can_show_in_chat ?? dbNote.canShowInChat),
        entries: parseEntriesFromContent(dbNote.content || ""),
      };
      setNotes((prev) => [newNote, ...prev]);
      return dbNote.id;
    } catch (err) {
      console.error("Failed to create note:", err);
      throw err;
    }
  };

  // Update a note
  const updateNote = async (noteId, updates) => {
    try {
      const updated = await apiUpdateNote(noteId, updates);
      setNotes((prev) =>
        prev.map((n) => {
          if (n.id !== noteId) return n;
          const newContent = updates.content ?? n.content;
          const nextMessageId = updates.messageId ?? n.messageId;
          return {
            ...n,
            ...updates,
            content: newContent,
            preview: buildPreview(newContent || updates.title || n.title),
            entries: parseEntriesFromContent(newContent),
            messageId: nextMessageId,
            canShowInChat: updated?.can_show_in_chat ?? updated?.canShowInChat ?? n.canShowInChat,
          };
        })
      );
    } catch (err) {
      console.error("Failed to update note:", err);
      throw err;
    }
  };

  // Delete a note
  const deleteNote = async (noteId) => {
    try {
      await apiDeleteNote(noteId);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      if (noteEditorId === noteId) {
        clearNoteEditor();
      }
    } catch (err) {
      console.error("Failed to delete note:", err);
      throw err;
    }
  };

  // Toggle pin status for a note
  const togglePinNote = async (noteId, shouldPin) => {
    try {
      await apiTogglePinNote(noteId, shouldPin);
      setNotes((prev) =>
        prev.map((n) =>
          n.id === noteId ? { ...n, pinned: shouldPin } : n
        )
      );
    } catch (err) {
      console.error("Failed to toggle pin note:", err);
      throw err;
    }
  };

  // Open note in editor
  const openNoteEditor = (note) => {
    setNoteEditorId(note.id);
    setNoteEditorTitle(note.title || "");
    setNoteEditorContent(note.content || "");
    setNoteEditorColor(note.color || "#06B6D4");
    setNoteEditorEntries(note.entries || []);
  };

  // Clear note editor
  const clearNoteEditor = () => {
    setNoteEditorId(null);
    setNoteEditorTitle("");
    setNoteEditorContent("");
    setNoteEditorColor("#06B6D4");
    setNoteEditorEntries([]);
    setNoteEntryDraft("");
  };

  // Save note editor changes
  const saveNoteEditor = async () => {
    if (!noteEditorId) return;
    
    const content = rebuildNoteContentFromEntries(noteEditorEntries);
    await updateNote(noteEditorId, {
      title: noteEditorTitle || "Untitled Note",
      content,
      color: noteEditorColor,
    });
  };

  // Add manual note entry
  const addManualNoteEntry = async (text) => {
    if (!noteEditorId || !text.trim()) return;

    const newEntry = {
      id: Date.now(),
      messageId: null,
      userText: text.trim(),
      aiText: "",
      isManual: true,
    };

    const newEntries = [...noteEditorEntries, newEntry];
    setNoteEditorEntries(newEntries);

    const newContent = rebuildNoteContentFromEntries(newEntries);
    setNoteEditorContent(newContent);

    await updateNote(noteEditorId, {
      title: noteEditorTitle,
      content: newContent,
    });

    setNoteEntryDraft("");
  };

  // Remove note entry
  const removeNoteEntry = async (noteId, entryId) => {
    const note = notes.find((n) => n.id === noteId);
    if (!note) return;

    const newEntries = (note.entries || []).filter((e) => e.id !== entryId);
    const newContent = rebuildNoteContentFromEntries(newEntries);

    if (noteEditorId === noteId) {
      setNoteEditorEntries(newEntries);
      setNoteEditorContent(newContent);
    }

    await updateNote(noteId, {
      title: note.title,
      content: newContent,
      folderId: note.folderId,
      chatId: note.chatId,
    });
  };

  // Computed values
  const sortedNotes = useMemo(() => {
    return [...notes].sort((a, b) => {
      if (a.pinned !== b.pinned) return b.pinned ? 1 : -1;
      return b.id - a.id;
    });
  }, [notes]);

  const unassignedNotes = useMemo(
    () => notes.filter((n) => !n.folderId),
    [notes]
  );

  return {
    // State
    notes,
    noteEditorId,
    noteEditorTitle,
    noteEditorContent,
    noteEditorColor,
    noteEditorEntries,
    noteEntryDraft,
    sortedNotes,
    unassignedNotes,
    
    // Setters
    setNotes,
    setNoteEditorId,
    setNoteEditorTitle,
    setNoteEditorContent,
    setNoteEditorColor,
    setNoteEditorEntries,
    setNoteEntryDraft,
    
    // Actions
    loadNotes,
    createNote,
    updateNote,
    deleteNote,
    togglePinNote,
    openNoteEditor,
    clearNoteEditor,
    saveNoteEditor,
    addManualNoteEntry,
    removeNoteEntry,
  };
}
