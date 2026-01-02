import { Router } from "express";
import healthRoutes from "./health.route";
import authRoutes from "./auth.route";
import { requireAuth, requireRole } from "../middlewares/auth";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);

// Protected test route
router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// Admin-only test route
router.get("/admin/pulse", requireAuth, requireRole("owner", "admin"), (req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

export default router;
