const pool = require("../config/db");

// Shared SELECT with metadata so callers can know if "Show in Chat" is safe
const baseNoteSelect = `
  SELECT 
    n.*, 
    n.chat_id AS source_chat_id,
    n.message_id AS source_message_id,
    CASE 
      WHEN n.chat_id IS NOT NULL 
        AND n.message_id IS NOT NULL
        AND c.id IS NOT NULL 
        AND c.is_deleted = 0 
        AND m.id IS NOT NULL THEN 1 
      ELSE 0 
    END AS can_show_in_chat
  FROM notes n
  LEFT JOIN chats c ON c.id = n.chat_id AND c.user_id = ?
  LEFT JOIN messages m ON m.id = n.message_id AND m.chat_id = n.chat_id AND m.is_deleted = 0
`;

// Get all notes for a user
exports.getNotesByUserId = async (userId) => {
  const [rows] = await pool.query(
    `${baseNoteSelect}
     WHERE n.user_id = ? AND n.is_deleted = 0
     ORDER BY n.pinned DESC, n.updated_at DESC`,
    [userId, userId]
  );
  return rows;
};

// Get a single note by ID
exports.getNoteById = async (noteId, userId) => {
  const [rows] = await pool.query(
    `${baseNoteSelect}
     WHERE n.id = ? AND n.user_id = ? AND n.is_deleted = 0`,
    [userId, noteId, userId]
  );
  return rows[0];
};

// Find note by chatId and title (for preventing duplicates)
exports.findNoteByChatIdAndTitle = async (chatId, title, userId) => {
  const [rows] = await pool.query(
    `${baseNoteSelect}
     WHERE n.chat_id = ? AND n.title = ? AND n.user_id = ? AND n.is_deleted = 0
     ORDER BY n.updated_at DESC
     LIMIT 1`,
    [userId, chatId, title, userId]
  );
  return rows[0];
};

// Find note by chatId only (fallback for finding chat-related notes)
exports.findNoteByChatId = async (chatId, userId) => {
  const [rows] = await pool.query(
    `${baseNoteSelect}
     WHERE n.chat_id = ? AND n.user_id = ? AND n.is_deleted = 0
     ORDER BY n.updated_at DESC
     LIMIT 1`,
    [userId, chatId, userId]
  );
  return rows[0];
};

// Create a new note
exports.createNote = async ({ userId, title, content, folderId = null, color = "#5227FF", chatId = null, messageId = null }) => {
  const [result] = await pool.query(
    "INSERT INTO notes (user_id, chat_id, message_id, title, content, note_folder_id, color, pinned) VALUES (?, ?, ?, ?, ?, ?, ?, 0)",
    [userId, chatId, messageId, title || "Untitled Note", content || "", folderId, color]
  );

  return exports.getNoteById(result.insertId, userId);
};

// Update note (title, content, folder)
exports.updateNote = async ({ noteId, userId, title, content, folderId, color, chatId = null, messageId = null }) => {
  const [result] = await pool.query(
    `UPDATE notes 
     SET title = ?, content = ?, note_folder_id = ?, color = ?, chat_id = ?, message_id = ?, updated_at = NOW()
     WHERE id = ? AND user_id = ? AND is_deleted = 0`,
    [title, content, folderId, color, chatId, messageId, noteId, userId]
  );

  if (result.affectedRows === 0) {
    return null; // Note not found or unauthorized
  }

  return exports.getNoteById(noteId, userId);
};

// Save a message to notes (create note entry)
exports.saveMessageToNote = async ({ userId, noteId, messageId, title, content, chatId = null }) => {
  // First, check if note exists and user owns it
  const [noteRows] = await pool.query(
    "SELECT id FROM notes WHERE id = ? AND user_id = ? AND is_deleted = 0",
    [noteId, userId]
  );

  if (noteRows.length === 0) {
    return null; // Note not found or unauthorized
  }

  // Update the note with new content
  const [result] = await pool.query(
    `UPDATE notes 
     SET content = ?, title = ?, chat_id = ?, message_id = ?, updated_at = NOW()
     WHERE id = ? AND user_id = ? AND is_deleted = 0`,
    [content, title, chatId, messageId, noteId, userId]
  );

  if (result.affectedRows === 0) {
    return null;
  }

  return exports.getNoteById(noteId, userId);
};

// Delete note (soft delete)
exports.deleteNote = async ({ noteId, userId }) => {
  console.log(`[NOTE.MODEL] Deleting note - noteId=${noteId} (type: ${typeof noteId}), userId=${userId}`);
  
  const [result] = await pool.query(
    "UPDATE notes SET is_deleted = 1 WHERE id = ? AND user_id = ? AND is_deleted = 0",
    [noteId, userId]
  );

  console.log(`[NOTE.MODEL] Delete result - affectedRows=${result.affectedRows}`);
  
  return result.affectedRows > 0;
};

// Pin/unpin note
exports.togglePinNote = async ({ noteId, userId, pinned }) => {
  const [result] = await pool.query(
    "UPDATE notes SET pinned = ? WHERE id = ? AND user_id = ? AND is_deleted = 0",
    [pinned ? 1 : 0, noteId, userId]
  );

  if (result.affectedRows === 0) {
    return null; // Note not found or unauthorized
  }

  const [rows] = await pool.query(
    "SELECT * FROM notes WHERE id = ?",
    [noteId]
  );

  return rows[0];
};

// Get all folders for a user
exports.getFoldersByUserId = async (userId) => {
  const [rows] = await pool.query(
    "SELECT * FROM note_folders WHERE user_id = ? AND is_deleted = 0 ORDER BY pinned DESC, created_at ASC",
    [userId]
  );
  return rows;
};

// Create a new note folder
exports.createFolder = async ({ userId, name, color = "#5227FF" }) => {
  const [result] = await pool.query(
    "INSERT INTO note_folders (user_id, name, color, pinned) VALUES (?, ?, ?, 0)",
    [userId, name || "New Folder", color]
  );

  const [rows] = await pool.query(
    "SELECT * FROM note_folders WHERE id = ?",
    [result.insertId]
  );

  return rows[0];
};

// Update folder
exports.updateFolder = async ({ folderId, userId, name, color }) => {
  const [result] = await pool.query(
    "UPDATE note_folders SET name = ?, color = ?, updated_at = NOW() WHERE id = ? AND user_id = ? AND is_deleted = 0",
    [name, color, folderId, userId]
  );

  if (result.affectedRows === 0) {
    return null;
  }

  const [rows] = await pool.query(
    "SELECT * FROM note_folders WHERE id = ?",
    [folderId]
  );

  return rows[0];
};

// Delete folder (soft delete)
exports.deleteFolder = async ({ folderId, userId }) => {
  const [result] = await pool.query(
    "UPDATE note_folders SET is_deleted = 1 WHERE id = ? AND user_id = ?",
    [folderId, userId]
  );

  return result.affectedRows > 0;
};

// Toggle pin folder
exports.togglePinFolder = async ({ folderId, userId, pinned }) => {
  const [result] = await pool.query(
    "UPDATE note_folders SET pinned = ? WHERE id = ? AND user_id = ? AND is_deleted = 0",
    [pinned ? 1 : 0, folderId, userId]
  );

  if (result.affectedRows === 0) {
    return null;
  }

  const [rows] = await pool.query(
    "SELECT * FROM note_folders WHERE id = ?",
    [folderId]
  );

  return rows[0];
};
