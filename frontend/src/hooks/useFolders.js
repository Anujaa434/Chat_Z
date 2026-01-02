import { useState, useEffect, useMemo } from "react";
import {
  initNotesApiAuth,
  fetchFolders as apiFetchFolders,
  createFolder as apiCreateFolder,
  updateFolder as apiUpdateFolder,
  deleteFolder as apiDeleteFolder,
  togglePinFolder as apiTogglePinFolder,
} from "../api/notes";

/**
 * Custom hook for managing folders and folder operations
 */
export function useFolders(token) {
  const [folders, setFolders] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState(null);

  // Initialize API auth when token changes
  useEffect(() => {
    if (token) {
      initNotesApiAuth(token);
      loadFolders();
    }
  }, [token]);

  // Load folders from API
  const loadFolders = async () => {
    try {
      const rows = await apiFetchFolders();
      const mapped = rows.map((f) => ({
        id: f.id,
        name: f.name || "Untitled Folder",
        color: f.color || "#06B6D4",
        pinned: !!f.pinned,
      }));
      setFolders(mapped);
    } catch (err) {
      console.error("Failed to load folders:", err);
    }
  };

  // Create a new folder
  const createFolder = async ({ name, color = "#06B6D4" }) => {
    try {
      const dbFolder = await apiCreateFolder({ name, color });
      const newFolder = {
        id: dbFolder.id,
        name: dbFolder.name || name,
        color: dbFolder.color || color,
        pinned: false,
      };
      setFolders((prev) => [newFolder, ...prev]);
      return dbFolder.id;
    } catch (err) {
      console.error("Failed to create folder:", err);
      throw err;
    }
  };

  // Update a folder
  const updateFolder = async (folderId, updates) => {
    try {
      await apiUpdateFolder(folderId, updates);
      setFolders((prev) =>
        prev.map((f) =>
          f.id === folderId ? { ...f, ...updates } : f
        )
      );
    } catch (err) {
      console.error("Failed to update folder:", err);
      throw err;
    }
  };

  // Delete a folder
  const deleteFolder = async (folderId) => {
    try {
      await apiDeleteFolder(folderId);
      setFolders((prev) => prev.filter((f) => f.id !== folderId));
      if (selectedFolderId === folderId) {
        setSelectedFolderId(null);
      }
    } catch (err) {
      console.error("Failed to delete folder:", err);
      throw err;
    }
  };

  // Toggle pin status for a folder
  const togglePinFolder = async (folderId, shouldPin) => {
    try {
      await apiTogglePinFolder(folderId, shouldPin);
      setFolders((prev) =>
        prev.map((f) =>
          f.id === folderId ? { ...f, pinned: shouldPin } : f
        )
      );
    } catch (err) {
      console.error("Failed to toggle pin folder:", err);
      throw err;
    }
  };

  // Computed values
  const activeFolder = useMemo(
    () => folders.find((f) => f.id === selectedFolderId) || null,
    [folders, selectedFolderId]
  );

  const sortedFolders = useMemo(() => {
    return [...folders].sort((a, b) => {
      if (a.pinned !== b.pinned) return b.pinned ? 1 : -1;
      return a.name.localeCompare(b.name);
    });
  }, [folders]);

  return {
    // State
    folders,
    selectedFolderId,
    activeFolder,
    sortedFolders,
    
    // Setters
    setFolders,
    setSelectedFolderId,
    
    // Actions
    loadFolders,
    createFolder,
    updateFolder,
    deleteFolder,
    togglePinFolder,
  };
}
