import axios from "axios";

const API_BASE = "http://localhost:4000/api";

export async function sendMessageToGemini(message, token) {
  const res = await axios.post(
    `${API_BASE}/gemini/chat`,
    { message },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data.reply;
}
