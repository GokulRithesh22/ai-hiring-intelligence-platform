import { dashboardRepository } from "./dashboard.repository";

export class DashboardService {
  async getSummary() {
    return dashboardRepository.getSummary();
  }

  async getCandidatesTable() {
    return dashboardRepository.getCandidatesTable();
  }
}

export const dashboardService = new DashboardService();
