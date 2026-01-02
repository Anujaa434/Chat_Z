
const pool = require("../config/db");

exports.getMessagesByChat = async (chatId) => {
  const [rows] = await pool.query(
    "SELECT * FROM messages WHERE chat_id = ? AND is_deleted = 0 ORDER BY created_at ASC",
    [chatId]
  );
  return rows;
};

exports.createMessage = async ({ chatId, userId, role, content }) => {
  // Insert message
  await pool.query(
    "INSERT INTO messages (chat_id, user_id, role, content) VALUES (?, ?, ?, ?)",
    [chatId, userId, role, content]
  );

  // Touch parent chat so sidebar ordering reflects latest activity
  await pool.query(
    "UPDATE chats SET updated_at = NOW() WHERE id = ?",
    [chatId]
  );
};

exports.deleteMessage = async ({ messageId, userId }) => {
  // Soft delete message only if it belongs to a chat owned by user
  const [result] = await pool.query(
    `UPDATE messages m
     JOIN chats c ON c.id = m.chat_id
     SET m.is_deleted = 1
     WHERE m.id = ? AND c.user_id = ?`,
    [messageId, userId]
  );

  // If deleted, also touch chat's updated_at
  if (result.affectedRows > 0) {
    const [[row]] = await pool.query(
      `SELECT chat_id FROM messages WHERE id = ?`,
      [messageId]
    );
    if (row && row.chat_id) {
      await pool.query("UPDATE chats SET updated_at = NOW() WHERE id = ?", [row.chat_id]);
    }
  }

  // Fallback: hard delete if soft delete did not affect any row
  if (result.affectedRows === 0) {
    const [del] = await pool.query(
      `DELETE m FROM messages m
       JOIN chats c ON c.id = m.chat_id
       WHERE m.id = ? AND c.user_id = ?`,
      [messageId, userId]
    );
    return del.affectedRows > 0;
  }

  return true;
};

exports.togglePinMessage = async ({ messageId, userId, pinned }) => {
  // Toggle pin status for a message (verify ownership via chat)
  const [result] = await pool.query(
    `UPDATE messages m
     JOIN chats c ON c.id = m.chat_id
     SET m.pinned = ?
     WHERE m.id = ? AND c.user_id = ?`,
    [pinned ? 1 : 0, messageId, userId]
  );

  if (result.affectedRows === 0) {
    return null; // Message not found or user doesn't own the chat
  }

  const [rows] = await pool.query(
    "SELECT * FROM messages WHERE id = ?",
    [messageId]
  );

  return rows[0];
};

exports.countPinnedMessages = async (chatId) => {
  // Count how many messages are currently pinned in a chat
  const [rows] = await pool.query(
    "SELECT COUNT(*) as count FROM messages WHERE chat_id = ? AND pinned = 1 AND is_deleted = 0",
    [chatId]
  );
  return rows[0]?.count || 0;
};
