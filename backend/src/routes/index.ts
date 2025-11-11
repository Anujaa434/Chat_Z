import { Router } from "express";
import health from "./health.route";

const router = Router();

// /api/ping
router.get("/ping", (_req, res) => {
  res.status(200).json({ ok: true, message: "pong" });
});

// /api/health
router.use("/health", health);

export default router;
