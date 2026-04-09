import { config as loadEnv } from "dotenv";

loadEnv();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to initialize the database package.");
}

export const databaseConfig = {
  connectionString,
  ssl:
    process.env.PGSSLMODE && process.env.PGSSLMODE !== "disable"
      ? { rejectUnauthorized: false }
      : undefined
};
