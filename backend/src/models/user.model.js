// src/models/user.model.ts
import { getPool } from "../config/db";

export type UserRole = "owner" | "admin" | "member";

export type DbUser = {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
};

export async function findByEmail(email: string): Promise<DbUser | null> {
  const [rows] = await getPool().query(
    "SELECT * FROM users WHERE email = ? LIMIT 1",
    [email]
  );
  const arr = rows as DbUser[];
  return arr[0] ?? null;
}

export async function createUser(input: {
  name: string;
  email: string;
  password_hash: string;
  role?: UserRole;
}) {
  const [res] = await getPool().query(
    "INSERT INTO users (name, email, password_hash, role) VALUES (?,?,?,?)",
    [input.name, input.email, input.password_hash, input.role ?? "member"]
  );
  // @ts-ignore
  const id = res.insertId as number;
  return {
    id,
    name: input.name,
    email: input.email,
    role: input.role ?? "member"
  };
}
