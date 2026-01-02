const pool = require("../config/db");

exports.getUserChats = async (userId) => {
  const [rows] = await pool.query(
    "SELECT * FROM chats WHERE user_id = ? AND is_deleted = 0 ORDER BY pinned DESC, updated_at DESC",
    [userId]
  );
  return rows;
};

exports.getChatById = async (chatId) => {
  const [rows] = await pool.query(
    "SELECT * FROM chats WHERE id = ?",
    [chatId]
  );
  return rows[0];
};

exports.createChat = async ({ userId, title, isAutoTitleGenerated = false }) => {
  const [result] = await pool.query(
    "INSERT INTO chats (user_id, title, is_auto_title_generated) VALUES (?, ?, ?)",
    [userId, title, isAutoTitleGenerated ? 1 : 0]
  );

  const [rows] = await pool.query(
    "SELECT * FROM chats WHERE id = ?",
    [result.insertId]
  );

  return rows[0];
};

exports.renameChat = async ({ chatId, title, userId }) => {
  // Update and verify ownership in one query
  const [result] = await pool.query(
    "UPDATE chats SET title = ?, is_auto_title_generated = 0 WHERE id = ? AND user_id = ?",
    [title, chatId, userId]
  );

  // Check if the update actually affected a row (ownership check)
  if (result.affectedRows === 0) {
    return null; // Chat not found or user doesn't own it
  }

  const [rows] = await pool.query(
    "SELECT * FROM chats WHERE id = ?",
    [chatId]
  );

  return rows[0];
};

/**
 * Update chat title and mark it as auto-generated
 * Only updates if isAutoTitleGenerated is still 0 (title hasn't been manually set)
 */
exports.updateAutoTitle = async ({ chatId, title, userId }) => {
  const [result] = await pool.query(
    "UPDATE chats SET title = ?, is_auto_title_generated = 1 WHERE id = ? AND user_id = ? AND is_auto_title_generated = 0",
    [title, chatId, userId]
  );

  // Check if the update actually affected a row
  if (result.affectedRows === 0) {
    return null; // Chat not found, user doesn't own it, or title was already manually set
  }

  const [rows] = await pool.query(
    "SELECT * FROM chats WHERE id = ?",
    [chatId]
  );

  return rows[0];
};

exports.deleteChat = async ({ chatId, userId }) => {
  // Soft delete: mark as deleted instead of removing permanently
  // This avoids foreign key constraint issues with messages
  const [result] = await pool.query(
    "UPDATE chats SET is_deleted = 1 WHERE id = ? AND user_id = ?",
    [chatId, userId]
  );

  // Return true if chat was deleted, false if not found or user doesn't own it
  return result.affectedRows > 0;
};

exports.togglePinChat = async ({ chatId, userId, pinned }) => {
  // Toggle pin status for a chat (verify ownership)
  const [result] = await pool.query(
    "UPDATE chats SET pinned = ? WHERE id = ? AND user_id = ?",
    [pinned ? 1 : 0, chatId, userId]
  );

  // Check if the update actually affected a row (ownership check)
  if (result.affectedRows === 0) {
    return null; // Chat not found or user doesn't own it
  }

  const [rows] = await pool.query(
    "SELECT * FROM chats WHERE id = ?",
    [chatId]
  );

  return rows[0];
};

exports.countPinnedChats = async (userId) => {
  // Count how many chats are currently pinned for this user
  const [rows] = await pool.query(
    "SELECT COUNT(*) as count FROM chats WHERE user_id = ? AND pinned = 1 AND is_deleted = 0",
    [userId]
  );
  return rows[0]?.count || 0;
};
