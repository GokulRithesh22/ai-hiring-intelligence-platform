import { emailEventsRepository } from "./email-events.repository";

export class EmailEventsService {
  async list() {
    return emailEventsRepository.list();
  }
}

export const emailEventsService = new EmailEventsService();
