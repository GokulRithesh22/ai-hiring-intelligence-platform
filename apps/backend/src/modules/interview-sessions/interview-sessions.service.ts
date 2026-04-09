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
    const completedSession = await interviewSessionsRepository.complete(sessionId, input);

    if (!completedSession) {
      throw new ApiError(404, "Interview session not found");
    }

    await applicationsService.finalizeInterviewIntelligence(
      sessionId,
      completedSession.applicationId,
      input.items.map((item) => ({
        question: item.question,
        answer: item.answer
      }))
    );

    return interviewSessionsRepository.findById(sessionId);
  }
}

export const interviewSessionsService = new InterviewSessionsService();
