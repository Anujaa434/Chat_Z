import "dotenv/config";
import app from "./app";
import { getEnv } from "./config/env";
import { testConnection } from "./config/db";

const env = getEnv();
const PORT = env.PORT || 4000;

app.listen(PORT, async () => {
  console.log(`API running on http://localhost:${PORT}`);
  try {
    await testConnection();
    console.log("✅ MySQL connected");
  } catch (e) {
    console.error("❌ MySQL connection failed:", e);
  }
});
