const Chat = require("../models/chat.model");
const Folder = require("../models/folder.model");
const Note = require("../models/note.model");
const Message = require("../models/message.model");

// 1. GET EVERYTHING (The "Anti-Amnesia" Load)
exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Run all queries in parallel for speed
    const [chats, folders, notes] = await Promise.all([
      Chat.getUserChats(userId),
      Folder.getUserFolders(userId),
      Note.getUserNotes(userId)
    ]);

    res.json({ chats, folders, notes });
  } catch (err) {
    console.error("Dashboard Load Error:", err);
    res.status(500).json({ error: "Failed to load dashboard data" });
  }
};

// --- FOLDER OPERATIONS ---
exports.createFolder = async (req, res) => {
  try {
    const folder = await Folder.createFolder({ ...req.body, userId: req.user.id });
    res.json(folder);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateFolder = async (req, res) => {
  try {
    await Folder.updateFolder(req.user.id, req.params.id, req.body);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteFolder = async (req, res) => {
  try {
    await Folder.deleteFolder(req.user.id, req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// --- NOTE OPERATIONS ---
exports.createNote = async (req, res) => {
  try {
    const note = await Note.createNote({ ...req.body, userId: req.user.id });
    res.json(note);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateNote = async (req, res) => {
  try {
    await Note.updateNote(req.user.id, req.params.id, req.body);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteNote = async (req, res) => {
  try {
    await Note.deleteNote(req.user.id, req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// --- CHAT UPDATES (Pin/Rename) ---
exports.updateChat = async (req, res) => {
  try {
    await Chat.updateChat(req.user.id, req.params.id, req.body);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteChat = async (req, res) => {
    try {
      await Chat.deleteChat(req.user.id, req.params.id);
      res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
  };