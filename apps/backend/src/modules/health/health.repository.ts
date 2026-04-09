import { query } from "@ai-hiring/database";

interface HealthRow {
  now: Date;
}

export class HealthRepository {
  async pingDatabase(): Promise<string> {
    const result = await query<HealthRow>("SELECT NOW()");
    return result.rows[0].now.toISOString();
  }
}

export const healthRepository = new HealthRepository();
