const pool = require("../config/db");

exports.getUserFolders = async (userId) => {
  // ✅ FIXED: Table name is 'note_folders'
  const [rows] = await pool.query(
    "SELECT * FROM note_folders WHERE user_id = ? AND is_deleted = 0 ORDER BY pinned DESC, created_at DESC",
    [userId]
  );
  return rows;
};

exports.createFolder = async ({ userId, name, color }) => {
  // ✅ FIXED: Table name is 'note_folders'
  const [result] = await pool.query(
    "INSERT INTO note_folders (user_id, name, color) VALUES (?, ?, ?)",
    [userId, name, color]
  );
  return { id: result.insertId, userId, name, color, pinned: 0 };
};

exports.updateFolder = async (userId, folderId, updates) => {
  const fields = [];
  const values = [];
  
  for (const [key, value] of Object.entries(updates)) {
    fields.push(`${key} = ?`);
    values.push(value);
  }
  
  if (fields.length === 0) return;
  values.push(folderId);
  values.push(userId);

  // ✅ FIXED: Table name is 'note_folders'
  await pool.query(
    `UPDATE note_folders SET ${fields.join(", ")} WHERE id = ? AND user_id = ?`,
    values
  );
};

exports.deleteFolder = async (userId, folderId) => {
  // ✅ FIXED: Table name is 'note_folders'
  await pool.query(
    "UPDATE note_folders SET is_deleted = 1 WHERE id = ? AND user_id = ?",
    [folderId, userId]
  );
};