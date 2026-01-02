import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
} from "react";
import "../../styles/dashboard.css";

import Header from "./Header";
import Sidebar from "./Sidebar";
import ChatPanel from "../chat/ChatPanel";
import NotesPanel from "../notes/NotesPanel";
import NotesListPanel from "../notes/NotesListPanel";
import { useAuth } from "../../contexts/AuthContext";
import {
  initChatApiAuth,
  fetchChats as apiFetchChats,
  createChat as apiCreateChat,
  fetchMessages as apiFetchMessages,
  sendMessage as apiSendMessage,
  renameChat as apiRenameChat,
  deleteChat as apiDeleteChat,
  togglePinChat as apiTogglePinChat,
  deleteMessage as apiDeleteMessage,
  togglePinMessage as apiTogglePinMessage,
} from "../../api/chat";
import {
  initNotesApiAuth,
  fetchNotes as apiFetchNotes,
  fetchFolders as apiFetchFolders,
  createNote as apiCreateNote,
  updateNote as apiUpdateNote,
  deleteNote as apiDeleteNote,
  togglePinNote as apiTogglePinNote,
  createFolder as apiCreateFolder,
  updateFolder as apiUpdateFolder,
  deleteFolder as apiDeleteFolder,
  togglePinFolder as apiTogglePinFolder,
} from "../../api/notes";

// ====== STATIC DATA & HELPERS (same as your Main.jsx) ======

const initialChats = [];

const initialFolders = [
  { id: 1, name: "Work Projects", color: "#06B6D4", pinned: false },
  { id: 2, name: "Personal", color: "#F97373", pinned: false },
  { id: 3, name: "Ideas", color: "#22C55E", pinned: false },
  { id: 4, name: "Resources", color: "#EAB308", pinned: false },
];

export const folderColors = [
  "#06B6D4",
  "#6366F1",
  "#22C55E",
  "#EAB308",
  "#F97373",
  "#A855F7",
  "#0EA5E9",
  "#F97316",
];

export function buildPreview(text) {
  if (!text) return "";
  const trimmed = text.trim();
  if (trimmed.length <= 90) return trimmed;
  return trimmed.slice(0, 90) + "…";
}

const initialNotes = [];

// Build note.content from its entries so preview stays in sync
export function rebuildNoteContentFromEntries(entries) {
  if (!entries || !entries.length) return "";
  const parts = [];

  entries.forEach((e) => {
    if (e.isManual) {
      parts.push(`Note: ${e.userText}`);
    } else {
      const seg = [];
      if (e.messageId) seg.push(`ID: ${e.messageId}`);
      seg.push(`You: ${e.userText}`);
      if (e.aiText) seg.push(`AI: ${e.aiText}`);
      parts.push(seg.join("\n\n"));
    }
  });

  return parts.join("\n\n---\n\n");
}

// Parse note.content back into entries (reverse of rebuildNoteContentFromEntries)
export function parseEntriesFromContent(content) {
  if (!content || !content.trim()) return [];

  const entries = [];
  const blocks = content.split("\n\n---\n\n");

  blocks.forEach((block, idx) => {
    block = block.trim();
    if (!block) return;

    if (block.startsWith("Note: ")) {
      // Manual note entry with "Note: " prefix
      entries.push({
        id: Date.now() + idx,
        messageId: null,
        userText: block.replace(/^Note: /, ""),
        aiText: "",
        isManual: true,
      });
    } else if (block.includes("You: ") && block.includes("AI: ")) {
      // Chat entry (has both "You:" and "AI:")
      const lines = block.split("\n\n");
      let userText = "";
      let aiText = "";
      let messageId = null;

      lines.forEach((line) => {
        if (line.startsWith("ID: ")) {
          const idStr = line.replace(/^ID: /, "").trim();
          const idNum = parseInt(idStr, 10);
          if (!Number.isNaN(idNum)) messageId = idNum;
        } else
        if (line.startsWith("You: ")) {
          userText = line.replace(/^You: /, "");
        } else if (line.startsWith("AI: ")) {
          aiText = line.replace(/^AI: /, "");
        }
      });

      if (userText) {
        entries.push({
          id: Date.now() + idx,
          messageId,
          userText,
          aiText,
          isManual: false,
        });
      }
    } else if (block.includes("You: ")) {
      // Chat entry (has "You:" but no "AI:")
      // Extract optional ID line
      let messageId = null;
      const idMatch = block.match(/ID:\s*(\d+)/);
      if (idMatch) {
        const idNum = parseInt(idMatch[1], 10);
        if (!Number.isNaN(idNum)) messageId = idNum;
      }
      const userText = block.replace(/^ID:.*\n\n/, "").replace(/^You: /, "").replace(/\n\n.*/, "");
      const aiMatch = block.match(/AI: (.+)/);
      const aiText = aiMatch ? aiMatch[1] : "";

      if (userText) {
        entries.push({
          id: Date.now() + idx,
          messageId,
          userText,
          aiText,
          isManual: false,
        });
      }
    } else {
      // Plain text entry (no prefix - treat as manual note)
      entries.push({
        id: Date.now() + idx,
        messageId: null,
        userText: block,
        aiText: "",
        isManual: true,
      });
    }
  });

  return entries;
}

export function darkenColor(hex, percent) {
  let color = hex.startsWith("#") ? hex.slice(1) : hex;
  if (color.length === 3) {
    color = color
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const num = parseInt(color, 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;

  r = Math.max(0, Math.min(255, Math.floor(r * (1 - percent))));
  g = Math.max(0, Math.min(255, Math.floor(g * (1 - percent))));
  b = Math.max(0, Math.min(255, Math.floor(b * (1 - percent))));

  return (
    "#" +
    ((1 << 24) + (r << 16) + (g << 8) + b)
      .toString(16)
      .slice(1)
      .toUpperCase()
  );
}

// ===== Gemini API helper =====
async function sendToGemini(message) {
  const token = localStorage.getItem("token");

  const res = await fetch("http://localhost:4000/api/gemini/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ message }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error || "Gemini failed");
  }

  return data.reply;
}

const DashboardLayout = () => {
  const { token } = useAuth();
  const [theme, setTheme] = useState("dark");

  const [activeTab, setActiveTab] = useState("chats"); // "chats" | "notes"
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  const [chats, setChats] = useState(initialChats);
  const [folders, setFolders] = useState(initialFolders);
  const [notes, setNotes] = useState(initialNotes);

  // chat selection
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedChatIds, setSelectedChatIds] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);

  // notes selection
  const [notesSelectionMode, setNotesSelectionMode] = useState(false);
  const [selectedNoteIds, setSelectedNoteIds] = useState([]);

  // folder selection
  const [folderSelectionMode, setFolderSelectionMode] = useState(false);
  const [selectedFolderIds, setSelectedFolderIds] = useState([]);

  // modals
  const [isFolderModalOpen, setFolderModalOpen] = useState(false);
  const [isNoteCreateModalOpen, setNoteCreateModalOpen] = useState(false);
  const [isRenameModalOpen, setRenameModalOpen] = useState(false);
  const [deleteConfirmNoteId, setDeleteConfirmNoteId] = useState(null);
  const [deleteConfirmChatId, setDeleteConfirmChatId] = useState(null);
  const [deleteConfirmMessageId, setDeleteConfirmMessageId] = useState(null);
  const [deleteConfirmFolderId, setDeleteConfirmFolderId] = useState(null);
  const [deleteConfirmNoteBlockId, setDeleteConfirmNoteBlockId] = useState(null);

  // move note modal
  const [isMoveNoteModalOpen, setMoveNoteModalOpen] = useState(false);
  const [noteToMove, setNoteToMove] = useState(null);
  const [selectedMoveFolderId, setSelectedMoveFolderId] = useState(null);
  
  // bulk move notes modal
  const [isBulkMoveModalOpen, setBulkMoveModalOpen] = useState(false);
  const [bulkMoveFolderId, setBulkMoveFolderId] = useState(null);

  // add files (unassigned notes) to folder modal
  const [isAddFilesModalOpen, setAddFilesModalOpen] = useState(false);
  const [addFilesFolderId, setAddFilesFolderId] = useState(null);
  const [addFilesSelectedIds, setAddFilesSelectedIds] = useState([]);

  // inline note editor
  const [noteEditorId, setNoteEditorId] = useState(null);
  const [noteEditorTitle, setNoteEditorTitle] = useState("");
  const [noteEditorContent, setNoteEditorContent] = useState("");
  const [noteEditorColor, setNoteEditorColor] = useState(folderColors[0]);
  const [noteEditorEntries, setNoteEditorEntries] = useState([]);
  const [noteEntryDraft, setNoteEntryDraft] = useState("");

  const [showNoteColorPopover, setShowNoteColorPopover] = useState(false);

  const [folderNameInput, setFolderNameInput] = useState("");
  const [noteTitleInput, setNoteTitleInput] = useState("");
  const [noteContentInput, setNoteContentInput] = useState("");
  const [renameInput, setRenameInput] = useState("");
  const [renameChatId, setRenameChatId] = useState(null);
  const [selectedFolderColor, setSelectedFolderColor] = useState(
    folderColors[0]
  );

  const [selectedFolderId, setSelectedFolderId] = useState(null);

  // notes view mode (folders | allNotes)
  const [notesViewMode, setNotesViewMode] = useState("folders");

  // create folder - notes selection
  const [selectedNotesForFolder, setSelectedNotesForFolder] = useState([]);
  const [isNoteSelectionExpanded, setIsNoteSelectionExpanded] = useState(false);

  // rename folder modal
  const [isRenameFolderModalOpen, setRenameFolderModalOpen] = useState(false);
  const [renameFolderInput, setRenameFolderInput] = useState("");
  const [renameFolderColor, setRenameFolderColor] = useState(folderColors[0]);
  const [renameFolderId, setRenameFolderId] = useState(null);

  const [model, setModel] = useState("gemini");
  const [messageInput, setMessageInput] = useState("");
  // messages: { [chatId]: [ {id, from, text, time, dateKey, pinnedAt?, sentAt } ] }
  const [chatMessages, setChatMessages] = useState({});

  // menus
  const [menuChatId, setMenuChatId] = useState(null);
  const [menuNoteId, setMenuNoteId] = useState(null);
  const [folderMenuId, setFolderMenuId] = useState(null);

  const [chatMenuDirection, setChatMenuDirection] = useState("down");
  const [noteMenuDirection, setNoteMenuDirection] = useState("down");
  const [folderMenuDirection, setFolderMenuDirection] = useState("down");
  const [messageMenuDirection, setMessageMenuDirection] = useState("down");
  const [noteEntryMenuDirection, setNoteEntryMenuDirection] = useState("down");

  const [openMessageMenuId, setOpenMessageMenuId] = useState(null);
  const [messageSelectionMode, setMessageSelectionMode] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState([]);

  const [openNoteEntryMenuId, setOpenNoteEntryMenuId] = useState(null);
  // Track which messages have been saved to notes per chat
  const [savedMessageIdsByChat, setSavedMessageIdsByChat] = useState({});

  // pinned bar index (-1 initial so first click goes to 0)
  const [pinnedBarIndex, setPinnedBarIndex] = useState(-1);
  const [showPinLimitToast, setShowPinLimitToast] = useState(false);
  const [showPinMessageLimitToast, setShowPinMessageLimitToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const unassignedNotes = useMemo(
    () => notes.filter((n) => !n.folderId),
    [notes]
  );

  // refs
  const messagesContainerRef = useRef(null);
  const messageRefs = useRef({});
  const messageInputRef = useRef(null);
  // note entries scroll container (for smart scroll like ChatGPT)
  const noteEntriesContainerRef = useRef(null);
  const noteEntryInputRef = useRef(null);

  // helper: decide menu direction
  const decideMenuDirection = (event, approxMenuHeight = 220) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const viewportHeight =
      window.innerHeight || document.documentElement.clientHeight || 0;

    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    if (spaceBelow < approxMenuHeight && spaceAbove > spaceBelow) {
      return "up";
    }
    return "down";
  };

  // close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      const target = event.target;
      if (
        !(
          target.closest(".chat-menu") ||
          target.closest(".note-menu") ||
          target.closest(".folder-menu") ||
          target.closest(".message-menu") ||
          target.closest(".note-entry-menu") ||
          target.closest(".chat-menu-btn") ||
          target.closest(".note-menu-btn") ||
          target.closest(".folder-action-btn") ||
          target.closest(".message-menu-btn") ||
          target.closest(".note-entry-menu-btn") ||
          target.closest(".note-color-popover") ||
          target.closest(".note-editor-color-tag")
        )
      ) {
        setMenuChatId(null);
        setMenuNoteId(null);
        setFolderMenuId(null);
        setOpenMessageMenuId(null);
        setOpenNoteEntryMenuId(null);
        setShowNoteColorPopover(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // auto-hide pin limit toast
  useEffect(() => {
    if (!showPinLimitToast) return;
    const t = setTimeout(() => setShowPinLimitToast(false), 2600);
    return () => clearTimeout(t);
  }, [showPinLimitToast]);

  useEffect(() => {
    if (!showPinMessageLimitToast) return;
    const t = setTimeout(() => setShowPinMessageLimitToast(false), 2600);
    return () => clearTimeout(t);
  }, [showPinMessageLimitToast]);

  // auto-hide generic toast
  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => setToastMessage(""), 2600);
    return () => clearTimeout(t);
  }, [toastMessage]);

  // reset message selection when chat changes
  useEffect(() => {
    setMessageSelectionMode(false);
    setSelectedMessageIds([]);
    setOpenMessageMenuId(null);
  }, [selectedChatId]);

  // auto-resize textarea (chats)
  useEffect(() => {
    if (!messageInputRef.current) return;
    const el = messageInputRef.current;
    el.style.height = "auto";
    const maxHeight = 200;
    const newHeight = Math.min(el.scrollHeight, maxHeight);
    el.style.height = `${newHeight}px`;
  }, [messageInput]);

  // auto-resize textarea (note entry)
  useEffect(() => {
    if (!noteEntryInputRef.current) return;
    const el = noteEntryInputRef.current;
    el.style.height = "auto";
    const maxHeight = 200;
    const newHeight = Math.min(el.scrollHeight, maxHeight);
    el.style.height = `${newHeight}px`;
  }, [noteEntryDraft]);

  // ===== Load chats on mount (persisted) =====
  useEffect(() => {
    initChatApiAuth();
    (async () => {
      try {
        const rows = await apiFetchChats();
        // Map DB rows to sidebar chat items
        const mapped = rows.map((r) => {
          const createdTs = r.created_at ? new Date(r.created_at).getTime() : Date.now();
          const updatedTs = r.updated_at ? new Date(r.updated_at).getTime() : createdTs;
          return {
            id: r.id,
            title: r.title,
            preview: "", // filled after first message send or fetch
            pinned: !!r.pinned,
            createdAt: createdTs,
            updatedAt: updatedTs,
          };
        });
        setChats(mapped);
      } catch (e) {
        // silent fail: unauth or no data
      }
    })();
  }, []);

  // ===== Load notes and folders whenever token changes (persisted) =====
  useEffect(() => {
    // if not logged in, clear notes state and exit
    if (!token) {
      setNotes([]);
      setFolders([]);
      return;
    }

    initNotesApiAuth();
    (async () => {
      try {
        // Fetch both notes and folders
        const [notesRows, foldersRows] = await Promise.all([
          apiFetchNotes(),
          apiFetchFolders(),
        ]);

        // Map DB notes to sidebar note items
        const mappedNotes = notesRows.map((r) => {
          const createdTs = r.created_at ? new Date(r.created_at).getTime() : Date.now();
          const updatedTs = r.updated_at ? new Date(r.updated_at).getTime() : createdTs;
          const chatId = r.source_chat_id ?? r.chat_id ?? null;
          const messageId = r.source_message_id ?? r.message_id ?? null;
          
          // Parse entries from content
          let entries = [];
          if (r.content) {
            entries = parseEntriesFromContent(r.content);
          }
          
          return {
            id: r.id,
            title: r.title || "Untitled Note",
            content: r.content || "",
            preview: buildPreview(r.content || r.title || ""),
            folderId: r.note_folder_id || null,
            chatId,
            messageId,
            canShowInChat: !!(r.can_show_in_chat ?? r.canShowInChat),
            color: r.color || "#5227FF",
            pinned: !!r.pinned,
            createdAt: createdTs,
            updatedAt: updatedTs,
            entries: entries, // Parsed from content
          };
        });
        setNotes(mappedNotes);

        // Map DB folders
        const mappedFolders = foldersRows.map((r) => {
          return {
            id: r.id,
            name: r.name || "Folder",
            color: r.color || "#5227FF",
            pinned: !!r.pinned,
          };
        });
        setFolders(mappedFolders);
      } catch (e) {
        console.warn("Failed to load notes/folders:", e);
        alert("Could not load notes. Please ensure backend is running and you are logged in.");
        setNotes([]);
        setFolders([]);
      }
    })();
  }, [token]);

  const normalizeDbMessages = (rows) => {
    return rows.map((r) => {
      const createdTs = r.created_at ? new Date(r.created_at).getTime() : Date.now();
      const d = r.created_at ? new Date(r.created_at) : new Date();
      const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const dateKey = new Date(createdTs).toISOString().slice(0, 10);
      return {
        id: r.id,
        from: r.role === "user" ? "user" : "ai",
        text: r.content,
        time,
        dateKey,
        pinnedAt: r.pinned ? createdTs : null,
        sentAt: createdTs,
      };
    });
  };

  const sortedChats = useMemo(
    () =>
      [...chats].sort((a, b) => {
        // Pinned first
        const pinDiff = Number(b.pinned) - Number(a.pinned);
        if (pinDiff !== 0) return pinDiff;
        // Then by recency (updatedAt, fallback to createdAt)
        const aTs = (a.updatedAt ?? a.createdAt ?? 0);
        const bTs = (b.updatedAt ?? b.createdAt ?? 0);
        return bTs - aTs;
      }),
    [chats]
  );

  const sortedFolders = useMemo(
    () => [...folders].sort((a, b) => Number(b.pinned) - Number(a.pinned)),
    [folders]
  );

  const sortedNotes = useMemo(
    () => [...notes].sort((a, b) => Number(b.pinned) - Number(a.pinned)),
    [notes]
  );

  const activeChat = useMemo(
    () => sortedChats.find((c) => c.id === selectedChatId) || null,
    [sortedChats, selectedChatId]
  );

  const activeMessages = activeChat ? chatMessages[activeChat.id] || [] : [];

  // PINNED MESSAGES: sort by sentAt (message time), newest first
  const pinnedMessages = useMemo(
    () =>
      activeMessages
        .filter((m) => m.pinnedAt)
        .slice()
        .sort((a, b) => {
          const aKey = a.sentAt ?? a.id;
          const bKey = b.sentAt ?? b.id;
          return bKey - aKey; // latest in chat first
        }),
    [activeMessages]
  );

  // track first pinned id (newest)
  const firstPinnedId = pinnedMessages[0]?.id ?? null;

  const activeFolder = useMemo(
    () => folders.find((f) => f.id === selectedFolderId) || null,
    [folders, selectedFolderId]
  );

  const noteEditorNote = useMemo(
    () => notes.find((n) => n.id === noteEditorId) || null,
    [notes, noteEditorId]
  );

  const activeChatIds = useMemo(() => new Set(chats.map((c) => c.id)), [chats]);

  const canNavigateNote = (note) => {
    if (!note) return false;
    const chatId = note.chatId ?? note.sourceChatId ?? note.chat_id ?? note.source_chat_id;
    const messageId = note.messageId ?? note.sourceMessageId ?? note.message_id ?? note.source_message_id;
    const canFlag = note.canShowInChat ?? note.can_show_in_chat;
    return Boolean(canFlag && chatId && messageId && activeChatIds.has(chatId));
  };

  // RESET pinnedBarIndex ONLY WHEN PINS CHANGE
  useEffect(() => {
    if (!pinnedMessages.length) {
      if (pinnedBarIndex !== -1) setPinnedBarIndex(-1);
      return;
    }
    setPinnedBarIndex(-1);
  }, [pinnedMessages.length, firstPinnedId]);

  // auto-scroll chats to bottom
  useEffect(() => {
    if (!messagesContainerRef.current) return;
    const el = messagesContainerRef.current;
    el.scrollTop = el.scrollHeight;
  }, [selectedChatId, activeMessages.length]);

  // auto-scroll NOTE BLOCKS like ChatGPT messages
  useEffect(() => {
    if (!noteEntriesContainerRef.current) return;
    const el = noteEntriesContainerRef.current;
    // Use timeout to ensure DOM has rendered
    setTimeout(() => {
      el.scrollTop = el.scrollHeight;
    }, 0);
  }, [noteEditorEntries.length, noteEditorId]);

  const handleThemeToggle = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const clearNoteEditor = () => {
    setNoteEditorId(null);
    setNoteEditorTitle("");
    setNoteEditorContent("");
    setNoteEditorColor(folderColors[0]);
    setNoteEditorEntries([]);
    setNoteEntryDraft("");
    setOpenNoteEntryMenuId(null);
    setShowNoteColorPopover(false);
  };

  const deleteMessagesWithPairs = async (chatId, targetIds) => {
    // Update UI immediately
    setChatMessages((prev) => {
      const original = prev[chatId] || [];
      const idsToDelete = new Set();

      original.forEach((msg, index) => {
        if (!targetIds.includes(msg.id)) return;
        idsToDelete.add(msg.id);

        if (msg.from === "user") {
          const next = original[index + 1];
          if (next && next.from === "ai") {
            idsToDelete.add(next.id);
          }
        } else if (msg.from === "ai") {
          const prevMsg = original[index - 1];
          if (prevMsg && prevMsg.from === "user") {
            idsToDelete.add(prevMsg.id);
          }
        }
      });

      const updated = original.filter((m) => !idsToDelete.has(m.id));
      // Fire-and-forget backend deletes
      Promise.all(
        Array.from(idsToDelete).map((id) =>
          apiDeleteMessage(chatId, id).catch(() => {})
        )
      );

      return { ...prev, [chatId]: updated };
    });

    // Update notes state - mark notes as not navigable if their source message was deleted
    setNotes((prev) =>
      prev.map((n) => {
        if (n.chatId !== chatId) return n;
        // Check if any entries reference the deleted messages
        const hasDeletedMessage = n.entries?.some((e) => e.messageId && targetIds.includes(e.messageId));
        if (hasDeletedMessage) {
          return { ...n, canShowInChat: false };
        }
        return n;
      })
    );
  };

  // ===== Chats =====
  const handleNewChat = async () => {
    // ChatGPT-like behavior: do NOT create chat until first message.
    setSelectedChatId(null);
    setMenuChatId(null);
    setActiveTab("chats");
    setSidebarExpanded(true);
    // Optionally focus input
    setTimeout(() => messageInputRef.current?.focus(), 0);
  };

  const handleSelectChatItem = async (chatId) => {
    setMenuChatId(null);
    if (!selectionMode) {
      setSelectedChatId(chatId);
      setActiveTab("chats");
      // lazy-load messages if not loaded
      if (!(chatMessages[chatId] && chatMessages[chatId].length)) {
        try {
          const rows = await apiFetchMessages(chatId);
          const mapped = normalizeDbMessages(rows);
          setChatMessages((prev) => ({ ...prev, [chatId]: mapped }));
        } catch (e) {
          // ignore
        }
      }
      return;
    }
    setSelectedChatIds((prev) =>
      prev.includes(chatId)
        ? prev.filter((id) => id !== chatId)
        : [...prev, chatId]
    );
  };

  const handleStartSelectionFromChat = (chatId) => {
    setSelectionMode(true);
    setSelectedChatIds((prev) =>
      prev.includes(chatId) ? prev : [...prev, chatId]
    );
    setMenuChatId(null);
  };

  const handleSelectAllChats = () => {
    setSelectionMode(true);
    setSelectedChatIds(chats.map((c) => c.id));
  };

  const handleClearChatSelection = () => {
    setSelectedChatIds([]);
  };

  const handleCancelChatSelection = () => {
    setSelectionMode(false);
    setSelectedChatIds([]);
  };

  const handleBulkPin = async () => {
    if (selectedChatIds.length === 0) return;
    
    // Check if we can pin these chats
    const currentPinned = chats.filter(c => c.pinned).length;
    const selectedUnpinned = selectedChatIds.filter(id => 
      !chats.find(c => c.id === id)?.pinned
    ).length;

    if (currentPinned + selectedUnpinned > 3) {
      setShowPinLimitToast(true);
      return;
    }

    try {
      // Pin all selected chats
      await Promise.all(selectedChatIds.map(id => apiTogglePinChat(id, true)));
      
      // Update local state
      setChats((prev) =>
        prev.map((c) =>
          selectedChatIds.includes(c.id) ? { ...c, pinned: true } : c
        )
      );
    } catch (err) {
      console.error("Failed to pin chats:", err);
      alert("Failed to pin some chats. Please try again.");
      return;
    }
  };

  const handleBulkUnpin = async () => {
    if (selectedChatIds.length === 0) return;
    
    try {
      // Unpin all selected chats
      await Promise.all(selectedChatIds.map(id => apiTogglePinChat(id, false)));
      
      // Update local state
      setChats((prev) =>
        prev.map((c) =>
          selectedChatIds.includes(c.id) ? { ...c, pinned: false } : c
        )
      );
    } catch (err) {
      console.error("Failed to unpin chats:", err);
      alert("Failed to unpin some chats. Please try again.");
      return;
    }
  };

  const handleBulkDelete = async () => {
    if (selectedChatIds.length === 0) return;
    
    // Delete all selected chats from backend
    try {
      await Promise.all(selectedChatIds.map(id => apiDeleteChat(id)));
      
      // Update local state
      setChats((prev) => prev.filter((c) => !selectedChatIds.includes(c.id)));
      if (selectedChatId && selectedChatIds.includes(selectedChatId)) {
        setSelectedChatId(null);
      }
      // Mark related notes as non-navigable now that their source chat is gone
      setNotes((prev) =>
        prev.map((n) => {
          const chatId = n.chatId ?? n.sourceChatId ?? n.chat_id;
          return selectedChatIds.includes(chatId) ? { ...n, canShowInChat: false } : n;
        })
      );
    } catch (err) {
      console.error("Failed to delete chats:", err);
      alert("Failed to delete some chats. Please try again.");
      return;
    }
    
    setSelectedChatIds([]);
    setMenuChatId(null);
    setSelectionMode(false);
  };

  const handlePinSingle = async (id) => {
    const chat = chats.find(c => c.id === id);
    if (!chat) return;

    const newPinnedStatus = !chat.pinned;

    // If trying to pin, check if at limit (3 pinned chats)
    if (newPinnedStatus) {
      const pinnedCount = chats.filter(c => c.pinned).length;
      if (pinnedCount >= 3) {
        setShowPinLimitToast(true);
        return;
      }
    }

    try {
      await apiTogglePinChat(id, newPinnedStatus);
      
      // Update local state
      setChats((prev) =>
        prev.map((c) => (c.id === id ? { ...c, pinned: newPinnedStatus } : c))
      );
    } catch (err) {
      console.error("Failed to pin/unpin chat:", err);
      alert("Failed to pin/unpin chat. Please try again.");
      return;
    }

    setMenuChatId(null);
  };

  const handleDeleteSingleChat = async (id) => {
    setDeleteConfirmChatId(id);
    setMenuChatId(null);
  };

  const confirmDeleteChat = async () => {
    if (!deleteConfirmChatId) return;
    const id = deleteConfirmChatId;
    setDeleteConfirmChatId(null);
    
    try {
      await apiDeleteChat(id);
      
      // Update local state
      setChats((prev) => prev.filter((c) => c.id !== id));
      if (selectedChatId === id) setSelectedChatId(null);
      setNotes((prev) => prev.map((n) => {
        const chatId = n.chatId ?? n.sourceChatId ?? n.chat_id;
        return chatId === id ? { ...n, canShowInChat: false } : n;
      }));
    } catch (err) {
      console.error("Failed to delete chat:", err);
      alert("Failed to delete chat. Please try again.");
      return;
    }
  };

  const openRenameModal = (chat) => {
    setRenameChatId(chat.id);
    setRenameInput(chat.title);
    setRenameModalOpen(true);
    setMenuChatId(null);
  };

  const handleRenameSave = async () => {
    if (!renameChatId || !renameInput.trim()) return;
    const newTitle = renameInput.trim();

    try {
      // Call API to rename chat on backend
      await apiRenameChat(renameChatId, newTitle);
      
      // Update local state
      setChats((prev) =>
        prev.map((c) => (c.id === renameChatId ? { ...c, title: newTitle } : c))
      );
    } catch (err) {
      console.error("Failed to rename chat:", err);
      alert("Failed to rename chat. Please try again.");
      return;
    }
    
    setRenameModalOpen(false);
    setRenameChatId(null);
  };

  // ===== Folders =====
  const handleCreateFolder = async () => {
    if (!folderNameInput.trim()) return;
    
    try {
      const newFolder = await apiCreateFolder({
        name: folderNameInput.trim(),
        color: selectedFolderColor,
      });
      setFolders((prev) => [...prev, newFolder]);
      
      // Move selected notes to the new folder
      if (selectedNotesForFolder.length > 0) {
        try {
          const noteUpdates = selectedNotesForFolder.map((noteId) => {
            const note = notes.find((n) => n.id === noteId);
            if (!note) {
              console.warn(`Note ${noteId} not found in state`);
              return null;
            }
            console.log(`Updating note ${noteId}:`, {
              title: note.title,
              content: note.content?.substring(0, 20),
              folderId: newFolder.id,
              color: note.color,
              chatId: note.chatId,
            });
            return apiUpdateNote(noteId, {
              title: note.title || "Untitled Note",
              content: note.content || "",
              folderId: newFolder.id,
              chatId: note.chatId || null,
            });
          });
          
          await Promise.all(noteUpdates.filter((u) => u !== null));
          
          // Update local state
          setNotes((prev) =>
            prev.map((n) =>
              selectedNotesForFolder.includes(n.id)
                ? { ...n, folderId: newFolder.id }
                : n
            )
          );
        } catch (err) {
          console.error("Failed to move notes to folder:", err);
          console.error("Error response:", err.response?.data);
          // Folder was created successfully, but notes move failed
          alert("Folder created, but failed to move some notes");
        }
      }
      
      setFolderNameInput("");
      setSelectedFolderColor(folderColors[0]);
      setSelectedNotesForFolder([]);
      setFolderModalOpen(false);
    } catch (err) {
      console.error("Failed to create folder:", err);
      alert("Failed to create folder");
    }
  };

  const handleDeleteFolder = async (id) => {
    setDeleteConfirmFolderId(id);
    setFolderMenuId(null);
  };

  const confirmDeleteFolder = async () => {
    if (!deleteConfirmFolderId) return;
    const id = deleteConfirmFolderId;
    setDeleteConfirmFolderId(null);
    
    try {
      await apiDeleteFolder(id);
      setFolders((prev) => prev.filter((f) => f.id !== id));
      if (selectedFolderId === id) {
        setSelectedFolderId(null);
      }
      setSelectedFolderIds((prev) => prev.filter((fId) => fId !== id));
    } catch (err) {
      console.error("Failed to delete folder:", err);
      alert("Failed to delete folder");
    }
  };

  const handleTogglePinFolder = (id) => {
    setFolders((prev) =>
      prev.map((f) => (f.id === id ? { ...f, pinned: !f.pinned } : f))
    );
    setFolderMenuId(null);
  };

  const handleRenameFolder = (id, newName) => {
    setFolders((prev) =>
      prev.map((f) => (f.id === id ? { ...f, name: newName } : f))
    );
  };

  const promptRenameFolder = (folder) => {
    setRenameFolderId(folder.id);
    setRenameFolderInput(folder.name);
    setRenameFolderColor(folder.color || folderColors[0]);
    setRenameFolderModalOpen(true);
  };

  const handleSaveRenameFolder = async () => {
    if (!renameFolderInput.trim()) return;

    try {
      const updatedFolder = await apiUpdateFolder(renameFolderId, {
        name: renameFolderInput.trim(),
        color: renameFolderColor,
      });
      
      setFolders((prev) =>
        prev.map((f) =>
          f.id === renameFolderId
            ? { ...f, name: updatedFolder.name, color: updatedFolder.color }
            : f
        )
      );
      
      setRenameFolderModalOpen(false);
      setRenameFolderInput("");
      setRenameFolderId(null);
      setRenameFolderColor(folderColors[0]);
    } catch (err) {
      console.error("Failed to rename folder:", err);
      alert("Failed to rename folder");
    }
  };

  const toggleNoteForFolder = (noteId) => {
    setSelectedNotesForFolder((prev) =>
      prev.includes(noteId)
        ? prev.filter((id) => id !== noteId)
        : [...prev, noteId]
    );
  };

  const clearSelectedNotesForFolder = () => {
    setSelectedNotesForFolder([]);
  };

  const selectAllNotesForFolder = () => {
    const allNoteIds = notes.map((n) => n.id);
    setSelectedNotesForFolder(allNoteIds);
  };

  const handleStartFolderSelection = (folderId) => {
    setFolderSelectionMode(true);
    setSelectedFolderIds((prev) =>
      prev.includes(folderId) ? prev : [...prev, folderId]
    );
    setFolderMenuId(null);
  };

  const handleToggleFolderSelectItem = (folderId) => {
    setSelectedFolderIds((prev) =>
      prev.includes(folderId)
        ? prev.filter((id) => id !== folderId)
        : [...prev, folderId]
    );
  };

  const handleFoldersBulkPin = () => {
    if (selectedFolderIds.length === 0) return;
    setFolders((prev) =>
      prev.map((f) =>
        selectedFolderIds.includes(f.id) ? { ...f, pinned: true } : f
      )
    );
  };

  const handleFoldersBulkUnpin = () => {
    if (selectedFolderIds.length === 0) return;
    setFolders((prev) =>
      prev.map((f) =>
        selectedFolderIds.includes(f.id) ? { ...f, pinned: false } : f
      )
    );
  };

  const handleFoldersBulkDelete = async () => {
    if (selectedFolderIds.length === 0) return;
    try {
      await Promise.all(selectedFolderIds.map((folderId) => apiDeleteFolder(folderId)));
      setFolders((prev) => prev.filter((f) => !selectedFolderIds.includes(f.id)));
      if (selectedFolderId && selectedFolderIds.includes(selectedFolderId)) {
        setSelectedFolderId(null);
      }
      setSelectedFolderIds([]);
      setFolderSelectionMode(false);
      setFolderMenuId(null);
    } catch (err) {
      console.error("Failed to delete folders:", err);
      alert("Failed to delete some folders");
    }
  };

  const handleCancelFolderSelection = () => {
    setFolderSelectionMode(false);
    setSelectedFolderIds([]);
  };

  const handleSelectAllFolders = () => {
    const allFolderIds = folders.map((f) => f.id);
    setSelectedFolderIds(allFolderIds);
  };

  const handleClearFolderSelection = () => {
    setSelectedFolderIds([]);
  };

  // ===== Notes selection & operations =====
  const handleSelectNoteItem = (noteId) => {
    setMenuNoteId(null);
    setSelectedNoteIds((prev) =>
      prev.includes(noteId)
        ? prev.filter((id) => id !== noteId)
        : [...prev, noteId]
    );
  };

  const handleStartNotesSelectionFromNote = (noteId) => {
    setNotesSelectionMode(true);
    setSelectedNoteIds((prev) =>
      prev.includes(noteId) ? prev : [...prev, noteId]
    );
    setMenuNoteId(null);
  };

  const handleNotesBulkPin = () => {
    if (selectedNoteIds.length === 0) return;
    setNotes((prev) =>
      prev.map((n) =>
        selectedNoteIds.includes(n.id) ? { ...n, pinned: true } : n
      )
    );
  };

  const handleNotesBulkUnpin = () => {
    if (selectedNoteIds.length === 0) return;
    setNotes((prev) =>
      prev.map((n) =>
        selectedNoteIds.includes(n.id) ? { ...n, pinned: false } : n
      )
    );
  };

  const handleNotesBulkDelete = async () => {
    if (selectedNoteIds.length === 0) return;
    
    try {
      // Delete each selected note from database
      await Promise.all(
        selectedNoteIds.map((noteId) => apiDeleteNote(noteId))
      );
      
      setNotes((prev) => prev.filter((n) => !selectedNoteIds.includes(n.id)));

      if (noteEditorId && selectedNoteIds.includes(noteEditorId)) {
        clearNoteEditor();
      }

      setSelectedNoteIds([]);
      setMenuNoteId(null);
      setNotesSelectionMode(false);
    } catch (err) {
      console.error("Failed to delete notes:", err);
      alert("Failed to delete one or more notes");
    }
  };

  const handleOpenBulkMoveModal = () => {
    if (selectedNoteIds.length === 0) return;
    setBulkMoveFolderId(folders[0]?.id || null);
    setBulkMoveModalOpen(true);
  };

  const handleOpenAddNotesToFolder = (folderId) => {
    setAddFilesFolderId(folderId);
    setAddFilesSelectedIds([]);
    setAddFilesModalOpen(true);
  };

  const handleConfirmBulkMove = async () => {
    if (selectedNoteIds.length === 0) return;
    
    const folderId = bulkMoveFolderId === "" || bulkMoveFolderId === null 
      ? null 
      : Number(bulkMoveFolderId);
    
    const folderObj = folderId ? folders.find((f) => f.id === folderId) : null;
    const newColor = folderObj?.color;

    try {
      // Update each selected note in database
      await Promise.all(
        selectedNoteIds.map((noteId) => {
          const note = notes.find(n => n.id === noteId);
          return apiUpdateNote(noteId, {
            title: note.title,
            content: note.content,
            folderId: folderId,
          });
        })
      );

      // Update local state
      setNotes((prev) =>
        prev.map((n) =>
          selectedNoteIds.includes(n.id)
            ? { ...n, folderId: folderId }
            : n
        )
      );

      // Update editor color if current note is being moved
      if (noteEditorId && selectedNoteIds.includes(noteEditorId) && newColor) {
        setNoteEditorColor(newColor);
      }

      setBulkMoveModalOpen(false);
      setSelectedNoteIds([]);
      setNotesSelectionMode(false);
    } catch (err) {
      console.error("Failed to move notes:", err);
      alert("Failed to move one or more notes");
    }
  };

  const toggleAddFileSelection = (noteId) => {
    setAddFilesSelectedIds((prev) =>
      prev.includes(noteId)
        ? prev.filter((id) => id !== noteId)
        : [...prev, noteId]
    );
  };

  const handleConfirmAddFiles = async () => {
    const targetFolderId = addFilesFolderId ? Number(addFilesFolderId) : null;
    if (!targetFolderId || addFilesSelectedIds.length === 0) {
      setAddFilesModalOpen(false);
      return;
    }

    const folderObj = folders.find((f) => f.id === targetFolderId);
    const newColor = folderObj?.color;

    try {
      await Promise.all(
        addFilesSelectedIds.map((noteId) => {
          const note = notes.find((n) => n.id === noteId);
          return apiUpdateNote(noteId, {
            title: note?.title,
            content: note?.content,
            folderId: targetFolderId,
          });
        })
      );

      setNotes((prev) =>
        prev.map((n) =>
          addFilesSelectedIds.includes(n.id)
            ? { ...n, folderId: targetFolderId }
            : n
        )
      );

      if (noteEditorId && addFilesSelectedIds.includes(noteEditorId) && newColor) {
        setNoteEditorColor(newColor);
      }
    } catch (err) {
      console.error("Failed to add files to folder:", err);
      alert("Failed to add one or more notes");
    }

    setAddFilesModalOpen(false);
    setAddFilesSelectedIds([]);
    setAddFilesFolderId(null);
  };

  const handlePinNoteSingle = async (id) => {
    try {
      const note = notes.find((n) => n.id === id);
      const newPinnedState = !note.pinned;

      // If trying to pin, check if at limit (3 pinned notes)
      if (newPinnedState) {
        const pinnedCount = notes.filter((n) => n.pinned).length;
        if (pinnedCount >= 3) {
          setShowPinLimitToast(true);
          return;
        }
      }

      // Save to database
      await apiTogglePinNote(id, newPinnedState);

      setNotes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, pinned: newPinnedState } : n))
      );
    } catch (err) {
      console.error("Failed to toggle note pin:", err);
      alert("Failed to toggle note pin");
    }
    setMenuNoteId(null);
  };

  const handleDeleteNoteSingle = async (id) => {
    // Show confirmation modal
    setDeleteConfirmNoteId(id);
  };

  const confirmDeleteNote = async () => {
    const id = deleteConfirmNoteId;
    setDeleteConfirmNoteId(null); // Close modal
    
    // Store the note in case we need to restore it
    const noteToDelete = notes.find(n => n.id === id);
    
    try {
      // Delete from database first
      console.log(`[DELETE NOTE] Attempting to delete note with ID: ${id}`);
      await apiDeleteNote(id);
      console.log(`[DELETE NOTE] Successfully deleted note with ID: ${id}`);

      // Remove from local state only after successful API call
      setNotes((prev) => prev.filter((n) => n.id !== id));
      if (noteEditorId === id) {
        clearNoteEditor();
      }
      // Unmark any saved messageIds that belonged to this note/chat
      if (noteToDelete && noteToDelete.chatId && Array.isArray(noteToDelete.entries)) {
        setSavedMessageIdsByChat((prevSaved) => {
          const setForChat = new Set(prevSaved[noteToDelete.chatId] || []);
          noteToDelete.entries.forEach((e) => {
            if (e.messageId) setForChat.delete(e.messageId);
          });
          return { ...prevSaved, [noteToDelete.chatId]: setForChat };
        });
      }
      
      // No success message - direct delete
    } catch (err) {
      console.error("Failed to delete note:", err);
      const errorMsg = err.response?.data?.error || err.message || "Unknown error";
      alert("Failed to delete note: " + errorMsg);
      
      // Ensure the note is still in the list if deletion failed
      if (noteToDelete) {
        setNotes((prev) => {
          const exists = prev.some(n => n.id === id);
          if (!exists) {
            return [noteToDelete, ...prev];
          }
          return prev;
        });
      }
    }
    setMenuNoteId(null);
  };

  const handleSelectAllNotes = () => {
    setNotesSelectionMode(true);
    setSelectedNoteIds(notes.map((n) => n.id));
  };

  const handleClearNoteSelection = () => {
    setSelectedNoteIds([]);
  };

  const handleCancelNotesSelection = () => {
    setNotesSelectionMode(false);
    setSelectedNoteIds([]);
  };

  const openNoteEditor = (note) => {
    // Try to parse entries from content if entries are empty
    let entries = note.entries || [];
    if ((!entries || entries.length === 0) && note.content) {
      // First try to parse as formatted content (from saved chat)
      entries = parseEntriesFromContent(note.content);
      
      // If parsing yielded no entries, treat as manual note
      if (entries.length === 0) {
        entries = [
          {
            id: Date.now(),
            messageId: null,
            userText: note.content,
            aiText: "",
            isManual: true,
          },
        ];
      }
    }

    setNoteEditorId(note.id);
    setNoteEditorTitle(note.title);
    setNoteEditorContent(note.content || "");
    setNoteEditorColor(note.color || folderColors[0]);
    setNoteEditorEntries(entries);
    setNoteEntryDraft("");
    setMenuNoteId(null);
    setShowNoteColorPopover(false);
  };

  const handleSaveNoteEditor = async () => {
    if (!noteEditorId) return;

    const hasEntries = noteEditorEntries && noteEditorEntries.length > 0;

    const content = hasEntries
      ? rebuildNoteContentFromEntries(noteEditorEntries)
      : noteEditorContent || "";

    const preview = buildPreview(content || noteEditorTitle);

    try {
      // Get the current note to get folderId
      const currentNote = notes.find((n) => n.id === noteEditorId);
      
      // Save to database
      const updated = await apiUpdateNote(noteEditorId, {
        title: noteEditorTitle.trim() || currentNote.title,
        content,
        folderId: currentNote.folderId,
        messageId: currentNote?.messageId ?? null,
        color: noteEditorColor,
      });

      // Update local state
      setNotes((prev) =>
        prev.map((n) =>
          n.id === noteEditorId
            ? {
                ...n,
                title: noteEditorTitle.trim() || n.title,
                content,
                preview,
                color: noteEditorColor,
                messageId: currentNote?.messageId ?? n.messageId,
                canShowInChat: updated?.can_show_in_chat ?? updated?.canShowInChat ?? n.canShowInChat,
              }
            : n
        )
      );

      setNoteEditorContent(content);
    } catch (err) {
      console.error("Failed to save note:", err);
      alert("Failed to save note");
    }
  };

  const handleCreateNote = async () => {
    if (!noteTitleInput.trim()) return;
    const defaultFolderId = null; // do not auto-assign a folder
    const defaultColor =
      folders.find((f) => f.id === defaultFolderId)?.color || folderColors[0];
    
    try {
      // Prepare note content - if it's a manual note without AI responses, just use plain text
      let noteContent = noteContentInput.trim() || "";
      
      // Save to database
      const dbNote = await apiCreateNote({
        title: noteTitleInput.trim(),
        content: noteContent,
        folderId: defaultFolderId,
        color: defaultColor,
      });

      // Update local state
      const sourceChatId = dbNote.source_chat_id ?? dbNote.chat_id ?? null;
      const sourceMessageId = dbNote.source_message_id ?? dbNote.message_id ?? null;
      const newNote = {
        id: dbNote.id,
        title: dbNote.title,
        content: dbNote.content || "",
        preview: buildPreview(noteContent || noteTitleInput),
        folderId: dbNote.note_folder_id,
        chatId: sourceChatId,
        messageId: sourceMessageId,
        color: dbNote.color || defaultColor,
        pinned: !!dbNote.pinned,
        canShowInChat: !!(dbNote.can_show_in_chat ?? dbNote.canShowInChat),
        entries: parseEntriesFromContent(noteContent) || [],
      };
      setNotes((prev) => [newNote, ...prev]);
      setNoteTitleInput("");
      setNoteContentInput("");
      setNoteCreateModalOpen(false);
      openNoteEditor(newNote);
    } catch (err) {
      console.error("Failed to create note:", err);
      alert("Failed to create note");
    }
  };

  const openMoveNoteModal = (note) => {
    const defaultFolderId = note.folderId || folders[0]?.id || null;
    setNoteToMove(note);
    setSelectedMoveFolderId(defaultFolderId);
    setMoveNoteModalOpen(true);
    setMenuNoteId(null);
  };

  const handleConfirmMoveNote = async () => {
    if (!noteToMove) return;
    
    const folderId = selectedMoveFolderId === "" || selectedMoveFolderId === null 
      ? null 
      : Number(selectedMoveFolderId);
    
    const folderObj = folderId ? folders.find((f) => f.id === folderId) : null;
    const newColor = folderObj?.color;

    try {
      // Save to database
      await apiUpdateNote(noteToMove.id, {
        title: noteToMove.title,
        content: noteToMove.content,
        folderId: folderId,
      });

      setNotes((prev) =>
        prev.map((n) =>
          n.id === noteToMove.id
            ? {
                ...n,
                folderId: folderId,
              }
            : n
        )
      );

      if (noteEditorId === noteToMove.id && newColor) {
        setNoteEditorColor(newColor);
      }
    } catch (err) {
      console.error("Failed to move note:", err);
      alert("Failed to move note");
    }

    setMoveNoteModalOpen(false);
    setNoteToMove(null);
  };

  // ===== Message pinning + delete =====
  const handleTogglePinMessage = async (messageId) => {
    if (!activeChat) return;
    const chatId = activeChat.id;

    const current = chatMessages[chatId] || [];
    const target = current.find((m) => m.id === messageId);
    if (!target) return;

    const newPinned = !target.pinnedAt;

    // If trying to pin, check if already at limit (3 pinned messages)
    if (newPinned) {
      const pinnedCount = current.filter((m) => m.pinnedAt).length;
      if (pinnedCount >= 3) {
        setShowPinMessageLimitToast(true);
        return;
      }
    }

    // Update UI immediately
    setChatMessages((prev) => ({
      ...prev,
      [chatId]: (prev[chatId] || []).map((m) =>
        m.id === messageId
          ? { ...m, pinnedAt: newPinned ? Date.now() : null }
          : m
      ),
    }));

    // Persist to backend
    try {
      await apiTogglePinMessage(chatId, messageId, newPinned);
    } catch (err) {
      console.error("Failed to pin/unpin message:", err);
      // Revert on error
      setChatMessages((prev) => ({
        ...prev,
        [chatId]: (prev[chatId] || []).map((m) =>
          m.id === messageId
            ? { ...m, pinnedAt: target.pinnedAt }
            : m
        ),
      }));
      
      // Show toast if it was a pin limit error
      if (err.response?.status === 400) {
        setShowPinMessageLimitToast(true);
      }
    }
  };

  const handleDeleteSingleMessage = (messageId) => {
    setDeleteConfirmMessageId(messageId);
  };

  const confirmDeleteMessage = () => {
    if (!activeChat || !deleteConfirmMessageId) return;
    const chatId = activeChat.id;
    const messageId = deleteConfirmMessageId;
    setDeleteConfirmMessageId(null);
    deleteMessagesWithPairs(chatId, [messageId]);
  };

  // ===== Message selection (bulk delete pairs) =====
  const handleToggleMessageSelectionMode = () => {
    setMessageSelectionMode((prev) => !prev);
    setSelectedMessageIds([]);
  };

  const toggleSelectMessage = (id) => {
    setMessageSelectionMode(true);
    setSelectedMessageIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleDeleteSelectedMessages = () => {
    if (!activeChat || selectedMessageIds.length === 0) return;
    deleteMessagesWithPairs(activeChat.id, selectedMessageIds);
    setSelectedMessageIds([]);
    setMessageSelectionMode(false);
  };

  const handleSaveSelectedMessagesToNote = async () => {
    if (!activeChat || selectedMessageIds.length === 0) return;
    const chatId = activeChat.id;
    const chatTitle = activeChat.title;
    const msgs = chatMessages[chatId] || [];
    const selected = msgs.filter((m) => selectedMessageIds.includes(m.id));
    const userMessages = selected.filter((m) => m.from === "user");

    if (userMessages.length === 0) {
      setSelectedMessageIds([]);
      setMessageSelectionMode(false);
      return;
    }

    // More robust lookup: try to find by chatId AND title, then by chatId only
    let existingNote = notes.find((n) => n.chatId === chatId && n.title === chatTitle);
    if (!existingNote) {
      existingNote = notes.find((n) => n.chatId === chatId);
    }

    // Build new entries while avoiding duplicates (by messageId)
    const buildEntry = (message) => {
      const idx = msgs.findIndex((m) => m.id === message.id);
      const next = idx !== -1 ? msgs[idx + 1] : null;
      const aiReply = next && next.from === "ai" ? next : null;
      return {
        id: Date.now() + Math.floor(Math.random() * 1000),
        messageId: message.id,
        userText: message.text,
        aiText: aiReply?.text || "",
        isManual: false,
      };
    };

    if (existingNote) {
      const dedupe = new Set((existingNote.entries || []).map((e) => e.messageId).filter(Boolean));
      const mergedEntries = [...(existingNote.entries || [])];
      userMessages.forEach((m) => {
        if (!dedupe.has(m.id)) {
          const entry = buildEntry(m);
          mergedEntries.push(entry);
          if (entry.messageId) dedupe.add(entry.messageId);
        }
      });

      const newContent = rebuildNoteContentFromEntries(mergedEntries);
      const newPreview = buildPreview(newContent || existingNote.title);
      const primaryMessageId = mergedEntries.find((e) => e.messageId)?.messageId || existingNote.messageId;

      try {
        const updated = await apiUpdateNote(existingNote.id, {
          title: chatTitle, // Ensure title matches chat title
          content: newContent,
          folderId: existingNote.folderId,
          chatId,
          messageId: primaryMessageId,
        });

        setNotes((prev) =>
          prev.map((n) =>
            n.id === existingNote.id
              ? {
                  ...n,
                  title: chatTitle, // Update title to match chat
                  content: newContent,
                  preview: newPreview,
                  entries: mergedEntries,
                  messageId: updated?.source_message_id ?? updated?.message_id ?? primaryMessageId,
                  canShowInChat: updated?.can_show_in_chat ?? updated?.canShowInChat ?? n.canShowInChat,
                }
              : n
          )
        );

        if (noteEditorId === existingNote.id) {
          setNoteEditorTitle(chatTitle);
          setNoteEditorEntries(mergedEntries);
          setNoteEditorContent(newContent);
        }

        // Mark messages as saved
        setSavedMessageIdsByChat((prev) => {
          const setForChat = new Set(prev[chatId] || []);
          userMessages.forEach((m) => setForChat.add(m.id));
          return { ...prev, [chatId]: setForChat };
        });
        
        setToastMessage(`Added ${userMessages.length} message(s) to existing note: "${chatTitle}"`);
      } catch (err) {
        console.error("Failed to save selected messages to existing note:", err);
        setToastMessage("Could not save selected messages. Please try again.");
      }
    } else {
      // Create a new single note for the chat and attach all selected messages at once
      const entries = userMessages.map(buildEntry);
      const content = rebuildNoteContentFromEntries(entries);
      const preview = buildPreview(content || chatTitle);
      const primaryMessageId = entries.find((e) => e.messageId)?.messageId || null;

      try {
        const dbNote = await apiCreateNote({
          title: chatTitle,
          content,
          folderId: null,
          color: folderColors[0],
          chatId,
          messageId: primaryMessageId,
        });

        const sourceChatId = dbNote.source_chat_id ?? dbNote.chat_id ?? chatId;
        const sourceMessageId = dbNote.source_message_id ?? dbNote.message_id ?? primaryMessageId;
        const newNote = {
          id: dbNote.id,
          title: dbNote.title,
          content: dbNote.content || content,
          preview,
          folderId: dbNote.note_folder_id,
          color: dbNote.color || folderColors[0],
          pinned: !!dbNote.pinned,
          chatId: sourceChatId,
          messageId: sourceMessageId,
          canShowInChat: !!(dbNote.can_show_in_chat ?? dbNote.canShowInChat),
          entries,
        };

        setNotes((prev) => [newNote, ...prev]);
        setSavedMessageIdsByChat((prev) => {
          const setForChat = new Set(prev[chatId] || []);
          userMessages.forEach((m) => setForChat.add(m.id));
          return { ...prev, [chatId]: setForChat };
        });
        
        setToastMessage(`Created new note "${chatTitle}" with ${userMessages.length} message(s)`);
      } catch (err) {
        console.error("Failed to create note for selected messages:", err);
        setToastMessage("Could not save selected messages. Please try again.");
      }
    }

    setSelectedMessageIds([]);
    setMessageSelectionMode(false);
  };

  const handlePinSelectedMessages = async () => {
    if (!activeChat || selectedMessageIds.length === 0) return;
    const chatId = activeChat.id;
    const msgs = chatMessages[chatId] || [];
    const selected = msgs.filter((m) => selectedMessageIds.includes(m.id));

    if (!selected.length) return;

    const shouldPin = selected.some((m) => !m.pinnedAt);
    const pinnedCount = msgs.filter((m) => m.pinnedAt).length;
    const pinsToAdd = shouldPin
      ? selected.filter((m) => !m.pinnedAt).length
      : 0;

    if (shouldPin && pinnedCount + pinsToAdd > 3) {
      setShowPinMessageLimitToast(true);
      return;
    }

    const selectedIds = new Set(selectedMessageIds);
    const nowTs = Date.now();

    // Optimistic UI update
    setChatMessages((prev) => ({
      ...prev,
      [chatId]: (prev[chatId] || []).map((m) =>
        selectedIds.has(m.id)
          ? { ...m, pinnedAt: shouldPin ? nowTs : null }
          : m
      ),
    }));

    try {
      await Promise.all(
        selected.map((m) => apiTogglePinMessage(chatId, m.id, shouldPin))
      );
    } catch (err) {
      console.error("Failed to bulk pin/unpin messages:", err);
      try {
        const rows = await apiFetchMessages(chatId);
        const mapped = normalizeDbMessages(rows);
        setChatMessages((prev) => ({ ...prev, [chatId]: mapped }));
      } catch {}
    }

    setSelectedMessageIds([]);
    setMessageSelectionMode(false);
  };

  const selectionShouldPin = useMemo(() => {
    if (!activeChat || selectedMessageIds.length === 0) return true;
    const msgs = chatMessages[activeChat.id] || [];
    const selected = msgs.filter((m) => selectedMessageIds.includes(m.id));
    return selected.some((m) => !m.pinnedAt);
  }, [activeChat, chatMessages, selectedMessageIds]);

  // ===== Scroll helpers =====
  const scrollToMessageById = (messageId) => {
    const node = messageRefs.current[messageId];
    if (node && messagesContainerRef.current) {
      node.scrollIntoView({ behavior: "smooth", block: "center" });
      node.classList.add("message-highlight");
      setTimeout(() => {
        node.classList.remove("message-highlight");
      }, 1200);
    }
  };

  // pinned bar click – cycle through pinned messages (most recent first)
  const handlePinnedBarClick = () => {
    if (!pinnedMessages.length) return;
    
    // Increment to next message first
    const nextIndex = (pinnedBarIndex + 1) % pinnedMessages.length;
    setPinnedBarIndex(nextIndex);
    
    // Then scroll to that message
    const next = pinnedMessages[nextIndex];
    if (next) {
      scrollToMessageById(next.id);
    }
  };

  // ===== Save message + answer to note =====
  const handleSaveMessageToNote = async (message) => {
    if (!activeChat) return;
    const chatId = activeChat.id;
    const chatTitle = activeChat.title;
    const msgs = chatMessages[chatId] || [];

    const idx = msgs.findIndex((m) => m.id === message.id);
    let aiReply = null;
    if (idx !== -1) {
      const next = msgs[idx + 1];
      if (next && next.from === "ai") aiReply = next;
    }

    const newEntry = {
      id: Date.now(),
      messageId: message.id,
      userText: message.text,
      aiText: aiReply?.text || "",
      isManual: false,
    };

    try {
      // More robust lookup: try to find by chatId AND title, then by chatId only
      let existing = notes.find((n) => n.chatId === chatId && n.title === chatTitle);
      if (!existing) {
        existing = notes.find((n) => n.chatId === chatId);
      }

      if (existing) {
        // skip if already saved
        if (existing.entries?.some((e) => e.messageId === message.id)) {
          setToastMessage("This message is already saved to notes for this chat.");
          return;
        }
        const entries = existing.entries ? [...existing.entries, newEntry] : [newEntry];
        const newContent = rebuildNoteContentFromEntries(entries);
        const newPreview = buildPreview(newContent || existing.title);

        if (noteEditorId === existing.id) {
          setNoteEditorTitle(chatTitle);
          setNoteEditorEntries(entries);
          setNoteEditorContent(newContent);
        }

        const updatedNote = await apiUpdateNote(existing.id, {
          title: chatTitle, // Ensure title matches chat title
          content: newContent,
          folderId: existing.folderId,
          chatId,
          messageId: message.id,
        });

        const updatedMessageId = updatedNote?.source_message_id ?? updatedNote?.message_id ?? message.id;

        setNotes((prev) =>
          prev.map((n) =>
            n.id === existing.id
              ? {
                  ...n,
                  title: chatTitle, // Update title to match chat
                  content: newContent,
                  preview: newPreview,
                  messageId: updatedMessageId,
                  canShowInChat: updatedNote?.can_show_in_chat ?? updatedNote?.canShowInChat ?? n.canShowInChat,
                  entries,
                }
              : n
          )
        );
        // Mark message as saved in UI state
        setSavedMessageIdsByChat((prev) => {
          const setForChat = new Set(prev[chatId] || []);
          setForChat.add(message.id);
          return { ...prev, [chatId]: setForChat };
        });
        return;
      }

      // Create new note with real DB id (no temp id)
      const defaultFolderId = null; // do not auto-assign a folder for new saved notes
      const defaultColor =
        folders.find((f) => f.id === defaultFolderId)?.color || folderColors[0];

      const entries = [newEntry];
      const content = rebuildNoteContentFromEntries(entries);
      const preview = buildPreview(content);

      const dbNote = await apiCreateNote({
        title: chatTitle, // Use chat title for consistency
        content,
        folderId: defaultFolderId,
        color: defaultColor,
        chatId,
        messageId: message.id,
      });

      const sourceChatId = dbNote.source_chat_id ?? dbNote.chat_id ?? chatId;
      const sourceMessageId = dbNote.source_message_id ?? dbNote.message_id ?? message.id;
      const newNote = {
        id: dbNote.id,
        title: dbNote.title,
        content: dbNote.content || content,
        preview,
        folderId: dbNote.note_folder_id,
        color: dbNote.color || defaultColor,
        pinned: !!dbNote.pinned,
        chatId: sourceChatId,
        messageId: sourceMessageId,
        canShowInChat: !!(dbNote.can_show_in_chat ?? dbNote.canShowInChat),
        entries,
      };

      setNotes((prev) => [newNote, ...prev]);
      // Mark message as saved in UI state
      setSavedMessageIdsByChat((prev) => {
        const setForChat = new Set(prev[chatId] || []);
        setForChat.add(message.id);
        return { ...prev, [chatId]: setForChat };
      });
      
      setToastMessage(`Created new note "${chatTitle}"`);
    } catch (err) {
      console.error("Error saving message to note:", err);
      setToastMessage("Failed to save message to note");
    }

    setOpenMessageMenuId(null);
  };

  // ===== Manual note entry =====
  const handleAddManualNoteEntry = async () => {
    if (!noteEditorId || !noteEntryDraft.trim()) return;
    const text = noteEntryDraft.trim();

    const newEntry = {
      id: Date.now(),
      messageId: null,
      userText: text,
      aiText: "",
      isManual: true,
    };

    try {
      setNotes((prev) => {
        const existing = prev.find((n) => n.id === noteEditorId);
        if (!existing) return prev;

        const entries = existing.entries
          ? [...existing.entries, newEntry]
          : [newEntry];
        const newContent = rebuildNoteContentFromEntries(entries);
        const newPreview = buildPreview(newContent || existing.title);

        setNoteEditorEntries(entries);
        setNoteEditorContent(newContent);

        // Save updated note to database
        apiUpdateNote(noteEditorId, {
          title: existing.title,
          content: newContent,
          folderId: existing.folderId,
        }).catch(err => console.error("Failed to save note entry:", err));

        return prev.map((n) =>
          n.id === existing.id
            ? { ...n, entries, content: newContent, preview: newPreview }
            : n
        );
      });
    } catch (err) {
      console.error("Error adding note entry:", err);
    }

    setNoteEntryDraft("");
  };

  // Enter = add block, Shift+Enter = new line
  const handleNoteEntryKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddManualNoteEntry();
    }
  };

  const handleUnsaveEntry = async (noteId, entryId) => {
    setNotes((prev) => {
      const note = prev.find((n) => n.id === noteId);
      if (!note) return prev;
      // Capture removed entry before filtering
      const removedEntry = (note.entries || []).find((e) => e.id === entryId);
      const entries = (note.entries || []).filter((e) => e.id !== entryId);
      const newContent = rebuildNoteContentFromEntries(entries);
      const newPreview = buildPreview(newContent || note.title);
      const newPrimaryMessageId = entries.find((e) => e.messageId)?.messageId || null;
      const newCanShow = !!(note.chatId && newPrimaryMessageId);

      if (noteEditorId === noteId) {
        setNoteEditorEntries(entries);
        setNoteEditorContent(newContent);
        setOpenNoteEntryMenuId(null);
      }

      return prev.map((n) =>
        n.id === noteId
          ? { ...n, entries, content: newContent, preview: newPreview, messageId: newPrimaryMessageId, canShowInChat: newCanShow }
          : n
      );
    });

    // Persist to database
    try {
      const note = notes.find((n) => n.id === noteId);
      if (note) {
        const entries = (note.entries || []).filter((e) => e.id !== entryId);
        const newContent = rebuildNoteContentFromEntries(entries);
        const newPrimaryMessageId = entries.find((e) => e.messageId)?.messageId || null;
        const newCanShow = !!(note.chatId && newPrimaryMessageId);
        await apiUpdateNote(noteId, {
          title: note.title || "Untitled Note",
          content: newContent || "",
          folderId: note.folderId || null,
          chatId: note.chatId || null,
          messageId: newPrimaryMessageId,
        });
        // If this entry referenced a message, unmark it as saved
        const removedEntry = (note.entries || []).find((e) => e.id === entryId);
        if (removedEntry && removedEntry.messageId && note.chatId) {
          setSavedMessageIdsByChat((prevSaved) => {
            const setForChat = new Set(prevSaved[note.chatId] || []);
            setForChat.delete(removedEntry.messageId);
            return { ...prevSaved, [note.chatId]: setForChat };
          });
        }
      }
    } catch (error) {
      console.error("Error unsaving entry:", error);
    }
  };

  const handleDeleteEntry = async (noteId, entryId) => {
    setDeleteConfirmNoteBlockId({ noteId, entryId });
    setOpenNoteEntryMenuId(null);
  };

  const confirmDeleteNoteBlock = async () => {
    if (!deleteConfirmNoteBlockId) return;
    const { noteId, entryId } = deleteConfirmNoteBlockId;
    setDeleteConfirmNoteBlockId(null);

    setNotes((prev) => {
      const note = prev.find((n) => n.id === noteId);
      if (!note) return prev;
      // Capture removed entry before filtering
      const removedEntry = (note.entries || []).find((e) => e.id === entryId);
      const entries = (note.entries || []).filter((e) => e.id !== entryId);
      const newContent = rebuildNoteContentFromEntries(entries);
      const newPreview = buildPreview(newContent || note.title);
      const newPrimaryMessageId = entries.find((e) => e.messageId)?.messageId || null;
      const newCanShow = !!(note.chatId && newPrimaryMessageId);

      if (noteEditorId === noteId) {
        setNoteEditorEntries(entries);
        setNoteEditorContent(newContent);
      }

      return prev.map((n) =>
        n.id === noteId
          ? { ...n, entries, content: newContent, preview: newPreview, messageId: newPrimaryMessageId, canShowInChat: newCanShow }
          : n
      );
    });

    // Persist to database
    try {
      const note = notes.find((n) => n.id === noteId);
      if (note) {
        const entries = (note.entries || []).filter((e) => e.id !== entryId);
        const newContent = rebuildNoteContentFromEntries(entries);
        const newPrimaryMessageId = entries.find((e) => e.messageId)?.messageId || null;
        const newCanShow = !!(note.chatId && newPrimaryMessageId);
        await apiUpdateNote(noteId, {
          title: note.title || "Untitled Note",
          content: newContent || "",
          folderId: note.folderId || null,
          chatId: note.chatId || null,
          messageId: newPrimaryMessageId,
        });
        // If this entry referenced a message, unmark it as saved
        const removedEntry = (note.entries || []).find((e) => e.id === entryId);
        if (removedEntry && removedEntry.messageId && note.chatId) {
          setSavedMessageIdsByChat((prevSaved) => {
            const setForChat = new Set(prevSaved[note.chatId] || []);
            setForChat.delete(removedEntry.messageId);
            return { ...prevSaved, [note.chatId]: setForChat };
          });
        }
      }
    } catch (error) {
      console.error("Error deleting entry:", error);
    }
  };

  const handleShowNoteInChats = (note) => {
    const chatId = note?.chatId ?? note?.sourceChatId ?? note?.chat_id ?? note?.source_chat_id;
    const messageId = note?.messageId ?? note?.sourceMessageId ?? note?.message_id ?? note?.source_message_id;

    if (!note || !canNavigateNote(note) || !chatId || !messageId) {
      setToastMessage("Original chat is no longer available for this note.");
      return;
    }
    setActiveTab("chats");
    setSelectedChatId(chatId);

    setTimeout(() => {
      scrollToMessageById(messageId);
    }, 350);

    setMenuNoteId(null);
  };

  const handleShowEntryInChat = (noteId, entry) => {
    const note = notes.find((n) => n.id === noteId);
    const chatId = note?.chatId ?? note?.sourceChatId ?? note?.chat_id ?? note?.source_chat_id;
    const messageId = entry?.messageId ?? entry?.sourceMessageId ?? entry?.message_id;

    if (!note || !canNavigateNote(note) || !chatId || !messageId) {
      setToastMessage("Original chat message not found (it may have been deleted).");
      return;
    }
    setActiveTab("chats");
    setSelectedChatId(chatId);
    setOpenNoteEntryMenuId(null);

    setTimeout(() => {
      scrollToMessageById(messageId);
    }, 350);
  };

  // ===== Send message (Centralized AI handler with lazy chat creation) =====
  const actuallySendMessage = async () => {
    if (!messageInput.trim()) return; // block empty or whitespace-only

    let chatId = activeChat?.id || null;

    // Do NOT create chat here; backend will create during send if chatId is null

    const now = new Date();
    const nowTs = now.getTime();
    const time = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const dateKey = now.toISOString().slice(0, 10);
    const trimmed = messageInput.trim();

    const userMsg = {
      id: nowTs,
      from: "user",
      text: trimmed,
      time,
      dateKey,
      pinnedAt: null,
      sentAt: nowTs,
    };

    setChatMessages((prev) => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), userMsg],
    }));

    setMessageInput("");

    try {
      const resp = await apiSendMessage({ chatId, message: trimmed, model });
      // If this was the first message, backend created a chat. Use its id/title.
      const returnedChatId = resp?.chatId;
      if (!chatId && returnedChatId) {
        chatId = returnedChatId;
        setSelectedChatId(returnedChatId);

        // Add chat to sidebar if not present
        const existing = chats.find((c) => c.id === returnedChatId);
        if (!existing) {
          const created = resp?.chat;
          const title = created?.title || (activeChat?.title || "Chat");
          const createdTs = created?.created_at ? new Date(created.created_at).getTime() : Date.now();
          const updatedTs = created?.updated_at ? new Date(created.updated_at).getTime() : createdTs;
          setChats((prev) => [
            ...prev,
            {
              id: returnedChatId,
              title,
              preview: trimmed,
              pinned: !!created?.pinned,
              createdAt: createdTs,
              updatedAt: updatedTs,
            },
          ]);
        }
      }
    } catch (err) {
      setChatMessages((prev) => ({
        ...prev,
        [chatId]: [
          ...(prev[chatId] || []),
          {
            id: nowTs + 1,
            from: "ai",
            text: "⚠️ Message send failed. Please try again.",
            time,
            dateKey,
            pinnedAt: null,
            sentAt: nowTs + 1,
          },
        ],
      }));
    }

    // Re-fetch messages to sync with DB (ensures correct IDs/timestamps)
    try {
      if (chatId) {
        const rows = await apiFetchMessages(chatId);
        const mapped = normalizeDbMessages(rows);
        setChatMessages((prev) => ({ ...prev, [chatId]: mapped }));
      }
    } catch {}

    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== chatId) return c;
        return { ...c, preview: trimmed, updatedAt: Date.now() };
      })
    );
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    actuallySendMessage();
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      actuallySendMessage();
    }
  };

  const emptyStateTitle = activeChat ? activeChat.title : "Welcome to ChatZ";
  const emptyStateSubtitle = activeChat
    ? "Ask anything, pin important replies, or save messages to notes."
    : "Start typing below to create a new chat.";

  // group messages by dateKey
  const groupedMessages = useMemo(() => {
    const groups = {};
    for (const msg of activeMessages) {
      if (!groups[msg.dateKey]) groups[msg.dateKey] = [];
      groups[msg.dateKey].push(msg);
    }
    return groups;
  }, [activeMessages]);

  const dateLabel = (dateKey) => {
    if (!dateKey) return "";
    const todayKey = new Date().toISOString().slice(0, 10);
    if (dateKey === todayKey) return "Today";
    // Yesterday logic
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const yesterdayKey = d.toISOString().slice(0, 10);
    if (dateKey === yesterdayKey) return "Yesterday";
    return new Date(dateKey).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const pinPreview = (text) => {
    if (!text) return "";
    const t = text.trim();
    if (t.length <= 80) return t;
    return t.slice(0, 80) + "…";
  };

  const currentPinnedForBar =
    pinnedMessages.length === 0 || pinnedBarIndex < 0
      ? pinnedMessages[0] || null
      : pinnedMessages[pinnedBarIndex % pinnedMessages.length];

  const notesForSidebar = activeFolder
    ? sortedNotes.filter((n) => n.folderId === activeFolder.id)
    : sortedNotes;

  const hasNoteEntries = noteEditorEntries && noteEditorEntries.length > 0;

  const rootClasses = `dashboard-root ${theme} ${sidebarExpanded ? "sidebar-expanded" : "sidebar-collapsed"}`;

  return (
    <div className={rootClasses}>
      <div className="container">
        <Header
          theme={theme}
          onToggleTheme={handleThemeToggle}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <div className="main-content">
          <div
            className={`sidebar-shell ${sidebarExpanded ? "open" : "collapsed"}`}
          >
            <Sidebar
              activeTab={activeTab}
              sortedChats={sortedChats}
              activeChat={activeChat}
              selectionMode={selectionMode}
              selectedChatIds={selectedChatIds}
              onSelectAllChats={handleSelectAllChats}
              onClearChatSelection={handleClearChatSelection}
              onNewChat={handleNewChat}
              onSelectChatItem={handleSelectChatItem}
              onStartSelectionFromChat={handleStartSelectionFromChat}
              onCancelChatSelection={handleCancelChatSelection}
              onBulkPin={handleBulkPin}
              onBulkUnpin={handleBulkUnpin}
              onBulkDelete={handleBulkDelete}
              onPinSingle={handlePinSingle}
              onDeleteSingleChat={handleDeleteSingleChat}
              onOpenRenameModal={openRenameModal}
              menuChatId={menuChatId}
              setMenuChatId={setMenuChatId}
              chatMenuDirection={chatMenuDirection}
              setChatMenuDirection={setChatMenuDirection}
              decideMenuDirection={decideMenuDirection}
              activeChatIds={activeChatIds}
              // notes sidebar stuff
              sortedFolders={sortedFolders}
              sortedNotes={sortedNotes}
              notesForSidebar={notesForSidebar}
              folders={folders}
              notes={notes}
              activeFolder={activeFolder}
              selectedFolderId={selectedFolderId}
              setSelectedFolderId={setSelectedFolderId}
              folderSelectionMode={folderSelectionMode}
              selectedFolderIds={selectedFolderIds}
              onCreateFolderClick={() => setFolderModalOpen(true)}
              onCreateNoteClick={() => setNoteCreateModalOpen(true)}
              onStartFolderSelection={handleStartFolderSelection}
              onToggleFolderSelectItem={handleToggleFolderSelectItem}
              onFoldersBulkPin={handleFoldersBulkPin}
              onFoldersBulkUnpin={handleFoldersBulkUnpin}
              onFoldersBulkDelete={handleFoldersBulkDelete}
              onSelectAllFolders={handleSelectAllFolders}
              onClearFolderSelection={handleClearFolderSelection}
              onCancelFolderSelection={handleCancelFolderSelection}
              folderMenuId={folderMenuId}
              setFolderMenuId={setFolderMenuId}
              folderMenuDirection={folderMenuDirection}
              setFolderMenuDirection={setFolderMenuDirection}
              onTogglePinFolder={handleTogglePinFolder}
              onDeleteFolder={handleDeleteFolder}
              onPromptRenameFolder={promptRenameFolder}
              notesSelectionMode={notesSelectionMode}
              selectedNoteIds={selectedNoteIds}
              onSelectAllNotes={handleSelectAllNotes}
              onClearNoteSelection={handleClearNoteSelection}
              onCancelNotesSelection={handleCancelNotesSelection}
              onNotesBulkPin={handleNotesBulkPin}
              onNotesBulkUnpin={handleNotesBulkUnpin}
              onNotesBulkDelete={handleNotesBulkDelete}
              onNotesBulkMove={handleOpenBulkMoveModal}
              onSelectNoteItem={handleSelectNoteItem}
              onStartNotesSelectionFromNote={handleStartNotesSelectionFromNote}
              menuNoteId={menuNoteId}
              setMenuNoteId={setMenuNoteId}
              noteMenuDirection={noteMenuDirection}
              setNoteMenuDirection={setNoteMenuDirection}
              onOpenNoteEditor={openNoteEditor}
              onShowNoteInChats={handleShowNoteInChats}
              onOpenMoveNoteModal={openMoveNoteModal}
              onPinNoteSingle={handlePinNoteSingle}
              onDeleteNoteSingle={handleDeleteNoteSingle}
              notesViewMode={notesViewMode}
              setNotesViewMode={setNotesViewMode}
              darkenColor={darkenColor}
              sidebarExpanded={sidebarExpanded}
              onToggleSidebar={() => setSidebarExpanded((prev) => !prev)}
            />
          </div>

          <section className="chat-area">
            {activeTab === "chats" ? (
              <ChatPanel
                activeChat={activeChat}
                model={model}
                setModel={setModel}
                pinnedMessages={pinnedMessages}
                pinnedBarIndex={pinnedBarIndex}
                currentPinnedForBar={currentPinnedForBar}
                pinPreview={pinPreview}
                onPinnedBarClick={handlePinnedBarClick}
                messageSelectionMode={messageSelectionMode}
                selectedMessageIds={selectedMessageIds}
                onDeleteSelectedMessages={handleDeleteSelectedMessages}
                onToggleMessageSelectionMode={
                  handleToggleMessageSelectionMode
                }
                onSaveSelectedMessagesToNote={handleSaveSelectedMessagesToNote}
                onPinSelectedMessages={handlePinSelectedMessages}
                selectionPinLabel={selectionShouldPin ? "Pin" : "Unpin"}
                groupedMessages={groupedMessages}
                dateLabel={dateLabel}
                openMessageMenuId={openMessageMenuId}
                setOpenMessageMenuId={setOpenMessageMenuId}
                messageMenuDirection={messageMenuDirection}
                setMessageMenuDirection={setMessageMenuDirection}
                decideMenuDirection={decideMenuDirection}
                toggleSelectMessage={toggleSelectMessage}
                handleSaveMessageToNote={handleSaveMessageToNote}
                handleTogglePinMessage={handleTogglePinMessage}
                handleDeleteSingleMessage={handleDeleteSingleMessage}
                messagesContainerRef={messagesContainerRef}
                messageRefs={messageRefs}
                savedMessageIds={savedMessageIdsByChat[activeChat?.id] || new Set()}
                showPinMessageLimitToast={showPinMessageLimitToast}
                emptyStateTitle={emptyStateTitle}
                emptyStateSubtitle={emptyStateSubtitle}
                handleSendMessage={handleSendMessage}
                messageInputRef={messageInputRef}
                messageInput={messageInput}
                setMessageInput={setMessageInput}
                handleInputKeyDown={handleInputKeyDown}
                showPinLimitToast={showPinLimitToast}
              />
            ) : noteEditorId ? (
              <NotesPanel
                activeFolder={notesViewMode === "allNotes" ? null : activeFolder}
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
                noteEditorCanShowInChat={canNavigateNote(noteEditorNote)}
                clearNoteEditor={clearNoteEditor}
                handleSaveNoteEditor={handleSaveNoteEditor}
              />
            ) : notesViewMode === "folders" && activeFolder ? (
              <NotesListPanel
                notesViewMode={notesViewMode}
                activeFolder={activeFolder}
                notes={notes}
                sortedNotes={sortedNotes}
                notesSelectionMode={notesSelectionMode}
                selectedNoteIds={selectedNoteIds}
                onSelectNoteItem={handleSelectNoteItem}
                onOpenNoteEditor={openNoteEditor}
                onStartNotesSelectionFromNote={handleStartNotesSelectionFromNote}
                menuNoteId={menuNoteId}
                setMenuNoteId={setMenuNoteId}
                noteMenuDirection={noteMenuDirection}
                setNoteMenuDirection={setNoteMenuDirection}
                decideMenuDirection={decideMenuDirection}
                onPinNoteSingle={handlePinNoteSingle}
                onDeleteNoteSingle={handleDeleteNoteSingle}
                onOpenMoveNoteModal={openMoveNoteModal}
                onOpenAddNotesToFolder={handleOpenAddNotesToFolder}
                onShowNoteInChats={handleShowNoteInChats}
                activeChatIds={activeChatIds}
                folders={folders}
              />
            ) : (
              <div className="empty-state" role="presentation">
                <p className="empty-title">Select a note to view</p>
                <p className="empty-subtitle">Choose a note from the sidebar to open the editor</p>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Rename Chat Modal */}
      {isRenameModalOpen && (
        <div className="modal-overlay" onClick={() => setRenameModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Rename Chat</h2>
            </div>
            <div className="modal-body">
              <input
                type="text"
                className="modal-input"
                value={renameInput}
                onChange={(e) => setRenameInput(e.target.value)}
                placeholder="Enter new chat name"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRenameSave();
                  if (e.key === "Escape") setRenameModalOpen(false);
                }}
              />
            </div>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setRenameModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="btn-save"
                onClick={handleRenameSave}
                disabled={!renameInput.trim()}
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create New Folder Modal */}
      {isFolderModalOpen && (
        <div className="modal-overlay" onClick={() => setFolderModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Folder</h2>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Folder Name</label>
                <input
                  type="text"
                  className="modal-input"
                  value={folderNameInput}
                  onChange={(e) => setFolderNameInput(e.target.value)}
                  placeholder="Enter folder name (e.g., Work, Ideas, Projects)"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && folderNameInput.trim()) {
                      handleCreateFolder();
                    }
                    if (e.key === "Escape") setFolderModalOpen(false);
                  }}
                />
              </div>
              <div className="form-group">
                <label>Folder Color</label>
                <div className="color-picker color-picker-compact">
                  {folderColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`color-option ${
                        selectedFolderColor === color ? "selected" : ""
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedFolderColor(color)}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => {
                  setFolderModalOpen(false);
                }}
              >
                Cancel
              </button>
              <button
                className="btn-save"
                onClick={handleCreateFolder}
                disabled={!folderNameInput.trim()}
              >
                Create Folder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Folder Modal */}
      {isRenameFolderModalOpen && (
        <div className="modal-overlay" onClick={() => setRenameFolderModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Rename Folder</h2>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Folder Name</label>
                <input
                  type="text"
                  className="modal-input"
                  value={renameFolderInput}
                  onChange={(e) => setRenameFolderInput(e.target.value)}
                  placeholder="Enter folder name"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && renameFolderInput.trim()) {
                      handleSaveRenameFolder();
                    }
                    if (e.key === "Escape") setRenameFolderModalOpen(false);
                  }}
                />
              </div>
              <div className="form-group">
                <label>Folder Color</label>
                <div className="color-picker">
                  {folderColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`color-option ${
                        renameFolderColor === color ? "selected" : ""
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setRenameFolderColor(color)}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setRenameFolderModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="btn-save"
                onClick={handleSaveRenameFolder}
                disabled={!renameFolderInput.trim()}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Files to Folder (unassigned only) */}
      {isAddFilesModalOpen && (
        <div className="modal-overlay" onClick={() => setAddFilesModalOpen(false)}>
          <div className="modal-dialog add-files-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Files to Folder</h2>
              <p className="modal-subtitle">Only showing notes not in any folder.</p>
            </div>
            <div className="modal-body">
              {unassignedNotes.length === 0 ? (
                <div className="empty-state compact">
                  <div className="empty-state-title">No unassigned notes</div>
                  <div className="empty-state-subtitle">
                    Create a new note or remove a note from its folder to add it here.
                  </div>
                </div>
              ) : (
                <div className="add-files-list">
                  {unassignedNotes.map((note) => (
                    <label key={note.id} className="add-file-row">
                      <input
                        type="checkbox"
                        checked={addFilesSelectedIds.includes(note.id)}
                        onChange={() => toggleAddFileSelection(note.id)}
                      />
                      <div className="add-file-title">{note.title || "Untitled note"}</div>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setAddFilesModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="btn-save"
                onClick={handleConfirmAddFiles}
                disabled={addFilesSelectedIds.length === 0}
              >
                Add Files
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Move Note to Folder Modal */}
      {isMoveNoteModalOpen && (
        <div className="modal-overlay" onClick={() => setMoveNoteModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Move Note to Folder</h2>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Select Folder</label>
                <select
                  className="modal-input"
                  value={selectedMoveFolderId || ""}
                  onChange={(e) => setSelectedMoveFolderId(e.target.value)}
                  autoFocus
                >
                  <option value="">No Folder</option>
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
              </div>
              {noteToMove && (
                <div className="note-preview-container">
                  <p className="note-preview-label">Moving note:</p>
                  <p className="note-preview-title">{noteToMove.title || "Untitled"}</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setMoveNoteModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="btn-save"
                onClick={handleConfirmMoveNote}
              >
                Move Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Move Notes to Folder Modal */}
      {isBulkMoveModalOpen && (
        <div className="modal-overlay" onClick={() => setBulkMoveModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Move Notes to Folder</h2>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Select Folder</label>
                <select
                  className="modal-input"
                  value={bulkMoveFolderId || ""}
                  onChange={(e) => setBulkMoveFolderId(e.target.value)}
                  autoFocus
                >
                  <option value="">No Folder</option>
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="note-preview-container">
                <p className="note-preview-label">
                  Moving {selectedNoteIds.length} note{selectedNoteIds.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setBulkMoveModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="btn-save"
                onClick={handleConfirmBulkMove}
              >
                Move Notes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create New Note Modal */}
      {isNoteCreateModalOpen && (
        <div className="modal-overlay" onClick={() => setNoteCreateModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Note</h2>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Note Title</label>
                <input
                  type="text"
                  className="modal-input"
                  value={noteTitleInput}
                  onChange={(e) => setNoteTitleInput(e.target.value)}
                  placeholder="Enter note title (e.g., My Ideas, Project Notes)"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && noteTitleInput.trim()) {
                      handleCreateNote();
                    }
                    if (e.key === "Escape") setNoteCreateModalOpen(false);
                  }}
                />
              </div>
              <div className="form-group">
                <label>Note Content</label>
                <textarea
                  className="modal-textarea"
                  value={noteContentInput || ""}
                  onChange={(e) => setNoteContentInput(e.target.value)}
                  placeholder="Enter your note content here... (optional)"
                  rows="6"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setNoteCreateModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="btn-save"
                onClick={handleCreateNote}
                disabled={!noteTitleInput.trim()}
              >
                Create Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Note Confirmation Modal */}
      {deleteConfirmNoteId && (
        <div className="modal-overlay" onClick={() => setDeleteConfirmNoteId(null)}>
          <div className="modal-dialog delete-confirm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Note</h2>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this note? This cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setDeleteConfirmNoteId(null)}
              >
                Cancel
              </button>
              <button
                className="btn-delete"
                onClick={confirmDeleteNote}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Chat Confirmation Modal */}
      {deleteConfirmChatId && (
        <div className="modal-overlay" onClick={() => setDeleteConfirmChatId(null)}>
          <div className="modal-dialog delete-confirm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Chat</h2>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this chat? This cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setDeleteConfirmChatId(null)}
              >
                Cancel
              </button>
              <button
                className="btn-delete"
                onClick={confirmDeleteChat}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Message Confirmation Modal */}
      {deleteConfirmMessageId && (
        <div className="modal-overlay" onClick={() => setDeleteConfirmMessageId(null)}>
          <div className="modal-dialog delete-confirm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Message</h2>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this message? This cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setDeleteConfirmMessageId(null)}
              >
                Cancel
              </button>
              <button
                className="btn-delete"
                onClick={confirmDeleteMessage}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Folder Confirmation Modal */}
      {deleteConfirmFolderId && (
        <div className="modal-overlay" onClick={() => setDeleteConfirmFolderId(null)}>
          <div className="modal-dialog delete-confirm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Folder</h2>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this folder? This cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setDeleteConfirmFolderId(null)}
              >
                Cancel
              </button>
              <button
                className="btn-delete"
                onClick={confirmDeleteFolder}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Note Block Confirmation Modal */}
      {deleteConfirmNoteBlockId && (
        <div className="modal-overlay" onClick={() => setDeleteConfirmNoteBlockId(null)}>
          <div className="modal-dialog delete-confirm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Note Block</h2>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this note block? This cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setDeleteConfirmNoteBlockId(null)}
              >
                Cancel
              </button>
              <button
                className="btn-delete"
                onClick={confirmDeleteNoteBlock}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pin Limit Toast Notification */}
      {showPinLimitToast && (
        <div className="modal-overlay" style={{ zIndex: 999, pointerEvents: 'none' }}>
          <div className="pin-limit-toast" style={{ pointerEvents: 'auto' }}>
            <div className="pin-limit-toast-inner">
              <div className="pin-limit-title">
                📌 Pin Limit Reached
              </div>
              <div className="pin-limit-message">
                Maximum 3 chats can be pinned
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message Pin Limit Toast Notification */}
      {showPinMessageLimitToast && (
        <div className="modal-overlay" style={{ zIndex: 999, pointerEvents: 'none' }}>
          <div className="pin-limit-toast" style={{ pointerEvents: 'auto' }}>
            <div className="pin-limit-toast-inner">
              <div className="pin-limit-title">
                📌 Pin Limit Reached
              </div>
              <div className="pin-limit-message">
                Maximum 3 messages can be pinned per chat
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Generic Toast Notification */}
      {toastMessage && (
        <div className="modal-overlay" style={{ zIndex: 999, pointerEvents: 'none' }}>
          <div className="pin-limit-toast" style={{ pointerEvents: 'auto' }}>
            <div className="pin-limit-toast-inner">
              <div className="pin-limit-message">
                {toastMessage}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;