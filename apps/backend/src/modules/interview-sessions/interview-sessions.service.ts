import type { CompleteInterviewSessionInput } from "@ai-hiring/shared-types";

import { ApiError } from "../../lib/http";
import { applicationsService } from "../applications/applications.service";
import { interviewSessionsRepository } from "./interview-sessions.repository";

export class InterviewSessionsService {
  async getSession(sessionId: string) {
    const session = await interviewSessionsRepository.findById(sessionId);

    if (!session) {
      throw new ApiError(404, "Interview session not found");
    }

    return session;
  }

  async completeSession(sessionId: string, input: CompleteInterviewSessionInput) {
    const session = await this.getSession(sessionId);
    await applicationsService.finalizeInterviewIntelligence(session.applicationId, input.items);
    return interviewSessionsRepository.complete(sessionId, input);
  }
}

export const interviewSessionsService = new InterviewSessionsService();
