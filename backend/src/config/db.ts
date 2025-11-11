import mysql from "mysql2/promise";
import { getEnv } from "./env";

let pool: mysql.Pool;

export const getPool = () => {
  if (!pool) {
    const env = getEnv();
    pool = mysql.createPool({
      host: env.DB_HOST,
      port: Number(env.DB_PORT),
      user: env.DB_USER,
      password: env.DB_PASS,
      database: env.DB_NAME,
      connectionLimit: 10
    });
  }
  return pool;
};

export const testConnection = async () => {
  const conn = await getPool().getConnection();
  await conn.ping();
  conn.release();
};
