const express = require("express");
const router = express.Router();

const { chatWithGemini } = require("../controllers/gemini.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

router.post("/chat", requireAuth, chatWithGemini);

module.exports = router;
