import { healthRepository } from "./health.repository";

export class HealthService {
  async getStatus() {
    const databaseTime = await healthRepository.pingDatabase();

    return {
      status: "ok",
      database: "up",
      databaseTime
    };
  }
}

export const healthService = new HealthService();
