import { Request, Response } from "express";
import { testConnection } from "../config/db";

export const getHealth = (_req: Request, res: Response) => {
  res.json({ ok: true, service: "api", uptime: process.uptime() });
};

export const getDbHealth = async (_req: Request, res: Response) => {
  try {
    await testConnection();
    res.json({ ok: true, db: "mysql" });
  } catch (e) {
    res.status(500).json({ ok: false, error: "db_unreachable" });
  }
};
