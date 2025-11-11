import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.string().optional(),
  DB_HOST: z.string(),
  DB_PORT: z.string().default("3306"),
  DB_NAME: z.string(),
  DB_USER: z.string(),
  DB_PASS: z.string(),
  JWT_SECRET: z.string().min(8)
});

export type Env = z.infer<typeof schema>;

export const getEnv = (): Env => {
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    console.error(parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment configuration");
  }
  return parsed.data;
};
