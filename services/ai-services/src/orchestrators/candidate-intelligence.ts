export interface CandidateIntelligenceRequest {
  resumeAnalysis: Record<string, unknown>;
  linkedinInsights: Record<string, unknown>;
  interviewSummary: string;
  scores: Record<string, unknown>;
}

export async function buildCandidateIntelligenceReport(
  request: CandidateIntelligenceRequest
) {
  return {
    overview:
      "Strong candidate with clear alignment to the approved role, supported by AI screening and interview evidence.",
    resumeAnalysis: request.resumeAnalysis,
    linkedinInsights: request.linkedinInsights,
    interviewSummary: request.interviewSummary,
    scores: request.scores,
    recommendation: "Advance to manager interview.",
    managerQuestions: [
      "What assumptions in your first-quarter plan would you validate immediately?",
      "What team dependencies would matter most for early success?"
    ]
  };
}
