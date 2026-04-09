import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { pool, withTransaction } from "./client";

async function ensureMigrationsTable(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id BIGSERIAL PRIMARY KEY,
      filename TEXT UNIQUE NOT NULL,
      executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

async function run(): Promise<void> {
  await ensureMigrationsTable();

  const migrationsDir = path.resolve(__dirname, "../sql/migrations");
  const files = (await readdir(migrationsDir)).filter((file) => file.endsWith(".sql")).sort();

  for (const file of files) {
    const alreadyApplied = await pool.query<{ filename: string }>(
      "SELECT filename FROM schema_migrations WHERE filename = $1",
      [file]
    );

    if (alreadyApplied.rowCount) {
      continue;
    }

    const sql = await readFile(path.join(migrationsDir, file), "utf8");

    await withTransaction(async (client) => {
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations (filename) VALUES ($1)", [file]);
    });
  }

  await pool.end();
}

run().catch(async (error) => {
  console.error("Migration failed", error);
  await pool.end();
  process.exitCode = 1;
});
