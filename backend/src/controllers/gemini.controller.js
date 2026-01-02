const { getGeminiResponse } = require("../services/gemini.service");

exports.chatWithGemini = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const reply = await getGeminiResponse(message);

    res.json({ success: true, reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gemini failed" });
  }
};
