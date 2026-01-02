import { useState } from "react";

/**
 * Custom hook for managing UI state (modals, selection modes, menus)
 */
export function useUIState() {
  // Theme
  const [theme, setTheme] = useState("dark");
  const [activeTab, setActiveTab] = useState("chats");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Selection modes
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedChatIds, setSelectedChatIds] = useState([]);
  const [notesSelectionMode, setNotesSelectionMode] = useState(false);
  const [selectedNoteIds, setSelectedNoteIds] = useState([]);
  const [folderSelectionMode, setFolderSelectionMode] = useState(false);
  const [selectedFolderIds, setSelectedFolderIds] = useState([]);
  const [messageSelectionMode, setMessageSelectionMode] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState([]);

  // Modals
  const [isFolderModalOpen, setFolderModalOpen] = useState(false);
  const [isNoteCreateModalOpen, setNoteCreateModalOpen] = useState(false);
  const [isRenameModalOpen, setRenameModalOpen] = useState(false);
  const [isMoveNoteModalOpen, setMoveNoteModalOpen] = useState(false);
  const [isBulkMoveModalOpen, setBulkMoveModalOpen] = useState(false);
  const [isAddFilesModalOpen, setAddFilesModalOpen] = useState(false);
  const [isRenameFolderModalOpen, setRenameFolderModalOpen] = useState(false);

  // Delete confirmations
  const [deleteConfirmNoteId, setDeleteConfirmNoteId] = useState(null);
  const [deleteConfirmChatId, setDeleteConfirmChatId] = useState(null);
  const [deleteConfirmMessageId, setDeleteConfirmMessageId] = useState(null);
  const [deleteConfirmFolderId, setDeleteConfirmFolderId] = useState(null);
  const [deleteConfirmNoteBlockId, setDeleteConfirmNoteBlockId] = useState(null);

  // Menu states
  const [menuChatId, setMenuChatId] = useState(null);
  const [menuNoteId, setMenuNoteId] = useState(null);
  const [folderMenuId, setFolderMenuId] = useState(null);
  const [openMessageMenuId, setOpenMessageMenuId] = useState(null);
  const [openNoteEntryMenuId, setOpenNoteEntryMenuId] = useState(null);

  // Menu directions
  const [chatMenuDirection, setChatMenuDirection] = useState("down");
  const [noteMenuDirection, setNoteMenuDirection] = useState("down");
  const [folderMenuDirection, setFolderMenuDirection] = useState("down");
  const [messageMenuDirection, setMessageMenuDirection] = useState("down");
  const [noteEntryMenuDirection, setNoteEntryMenuDirection] = useState("down");

  // Other UI states
  const [noteToMove, setNoteToMove] = useState(null);
  const [selectedMoveFolderId, setSelectedMoveFolderId] = useState(null);
  const [bulkMoveFolderId, setBulkMoveFolderId] = useState(null);
  const [addFilesFolderId, setAddFilesFolderId] = useState(null);
  const [addFilesSelectedIds, setAddFilesSelectedIds] = useState([]);
  const [notesViewMode, setNotesViewMode] = useState("folders");
  const [showNoteColorPopover, setShowNoteColorPopover] = useState(false);
  const [pinnedBarIndex, setPinnedBarIndex] = useState(-1);
  const [showPinLimitToast, setShowPinLimitToast] = useState(false);
  const [showPinMessageLimitToast, setShowPinMessageLimitToast] = useState(false);

  // Form inputs
  const [folderNameInput, setFolderNameInput] = useState("");
  const [noteTitleInput, setNoteTitleInput] = useState("");
  const [noteContentInput, setNoteContentInput] = useState("");
  const [renameInput, setRenameInput] = useState("");
  const [renameChatId, setRenameChatId] = useState(null);
  const [selectedFolderColor, setSelectedFolderColor] = useState("#06B6D4");
  const [renameFolderInput, setRenameFolderInput] = useState("");
  const [renameFolderColor, setRenameFolderColor] = useState("#06B6D4");
  const [renameFolderId, setRenameFolderId] = useState(null);

  // Helper: decide menu direction based on click position
  const decideMenuDirection = (event, approxMenuHeight = 220) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    return spaceBelow >= approxMenuHeight ? "down" : "up";
  };

  // Helper: toggle theme
  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return {
    // Theme & Layout
    theme,
    setTheme,
    toggleTheme,
    activeTab,
    setActiveTab,
    sidebarOpen,
    setSidebarOpen,

    // Selection modes
    selectionMode,
    setSelectionMode,
    selectedChatIds,
    setSelectedChatIds,
    notesSelectionMode,
    setNotesSelectionMode,
    selectedNoteIds,
    setSelectedNoteIds,
    folderSelectionMode,
    setFolderSelectionMode,
    selectedFolderIds,
    setSelectedFolderIds,
    messageSelectionMode,
    setMessageSelectionMode,
    selectedMessageIds,
    setSelectedMessageIds,

    // Modals
    isFolderModalOpen,
    setFolderModalOpen,
    isNoteCreateModalOpen,
    setNoteCreateModalOpen,
    isRenameModalOpen,
    setRenameModalOpen,
    isMoveNoteModalOpen,
    setMoveNoteModalOpen,
    isBulkMoveModalOpen,
    setBulkMoveModalOpen,
    isAddFilesModalOpen,
    setAddFilesModalOpen,
    isRenameFolderModalOpen,
    setRenameFolderModalOpen,

    // Delete confirmations
    deleteConfirmNoteId,
    setDeleteConfirmNoteId,
    deleteConfirmChatId,
    setDeleteConfirmChatId,
    deleteConfirmMessageId,
    setDeleteConfirmMessageId,
    deleteConfirmFolderId,
    setDeleteConfirmFolderId,
    deleteConfirmNoteBlockId,
    setDeleteConfirmNoteBlockId,

    // Menus
    menuChatId,
    setMenuChatId,
    menuNoteId,
    setMenuNoteId,
    folderMenuId,
    setFolderMenuId,
    openMessageMenuId,
    setOpenMessageMenuId,
    openNoteEntryMenuId,
    setOpenNoteEntryMenuId,

    // Menu directions
    chatMenuDirection,
    setChatMenuDirection,
    noteMenuDirection,
    setNoteMenuDirection,
    folderMenuDirection,
    setFolderMenuDirection,
    messageMenuDirection,
    setMessageMenuDirection,
    noteEntryMenuDirection,
    setNoteEntryMenuDirection,
    decideMenuDirection,

    // Other UI state
    noteToMove,
    setNoteToMove,
    selectedMoveFolderId,
    setSelectedMoveFolderId,
    bulkMoveFolderId,
    setBulkMoveFolderId,
    addFilesFolderId,
    setAddFilesFolderId,
    addFilesSelectedIds,
    setAddFilesSelectedIds,
    notesViewMode,
    setNotesViewMode,
    showNoteColorPopover,
    setShowNoteColorPopover,
    pinnedBarIndex,
    setPinnedBarIndex,
    showPinLimitToast,
    setShowPinLimitToast,
    showPinMessageLimitToast,
    setShowPinMessageLimitToast,

    // Form inputs
    folderNameInput,
    setFolderNameInput,
    noteTitleInput,
    setNoteTitleInput,
    noteContentInput,
    setNoteContentInput,
    renameInput,
    setRenameInput,
    renameChatId,
    setRenameChatId,
    selectedFolderColor,
    setSelectedFolderColor,
    renameFolderInput,
    setRenameFolderInput,
    renameFolderColor,
    setRenameFolderColor,
    renameFolderId,
    setRenameFolderId,
  };
}
