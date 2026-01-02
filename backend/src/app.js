import express from "express";
import cors from "cors";
import morgan from "morgan";
import routes from "./routes";
import { testConnection } from "./config/db";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// ✅ Mount all routes under /api
app.use("/api", routes);

// DB connection test (optional)
testConnection();

export default app;
