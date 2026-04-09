import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { pool } from "./client";

async function run(): Promise<void> {
  const seedDir = path.resolve(__dirname, "../sql/seeds");
  const files = (await readdir(seedDir)).filter((file) => file.endsWith(".sql")).sort();

  for (const file of files) {
    const sql = await readFile(path.join(seedDir, file), "utf8");
    await pool.query(sql);
  }

  await pool.end();
}

run().catch(async (error) => {
  console.error("Seed failed", error);
  await pool.end();
  process.exitCode = 1;
});
