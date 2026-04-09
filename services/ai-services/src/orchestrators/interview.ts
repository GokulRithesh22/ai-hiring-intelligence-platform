import { scoreFromText } from "../utils/mock.js";

export interface InterviewQuestionRequest {
  jobTitle: string;
  jobDescription: string;
  resumeSummary: string;
}

export interface InterviewEvaluationRequest {
  questions: Array<{ question: string; answer: string }>;
}

export async function generateInterviewQuestions(request: InterviewQuestionRequest) {
  return [
    `Tell us about a project where you solved a core ${request.jobTitle} problem under pressure.`,
    "How do you make trade-offs when goals conflict across functions?",
    "Which metrics would you monitor in your first 30 days, and why?",
    "Describe a time your initial strategy was wrong and how you corrected it."
  ];
}

export async function evaluateInterview(request: InterviewEvaluationRequest) {
  const answerEvaluations = request.questions.map((item, index) => {
    const normalized = item.answer.trim();
    const wordCount = normalized.split(/\s+/).filter(Boolean).length;
    const evidence = normalized
      .split(/(?<=[.!?])\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((snippet) => snippet.slice(0, 180));
    const quantifiedSignal = /(?:\b\d+(?:\.\d+)?%|\b\d+(?:\.\d+)?x\b|\$\s?\d+(?:,\d{3})*|\b\d+\s?(?:days|weeks|months|years)\b)/i.test(normalized);
    const ownershipSignal = /\b(i led|i owned|i built|i launched|i drove|i improved|i delivered|i partnered)\b/i.test(normalized);
    const score = scoreFromText(
      normalized,
      48 + Math.min(20, wordCount * 0.5) + (quantifiedSignal ? 12 : 0) + (ownershipSignal ? 8 : 0)
    );

    return {
      questionId: `q_${index + 1}`,
      score,
      rationale:
        wordCount >= 55
          ? "Answer gives enough context, actions, and outcome detail to evaluate reasoning and execution."
          : wordCount >= 30
            ? "Answer is directionally useful but would benefit from more specifics or measurable outcomes."
            : "Answer is brief and leaves important decision details unvalidated.",
      evidence
    };
  });

  const combinedAnswers = request.questions.map((item) => item.answer).join(" ");
  const averageScore =
    answerEvaluations.length === 0
      ? 0
      : Math.round(answerEvaluations.reduce((sum, item) => sum + item.score, 0) / answerEvaluations.length);
  const communicationScore = scoreFromText(combinedAnswers, Math.max(averageScore, 72));
  const knowledgeScore = scoreFromText(combinedAnswers, Math.max(averageScore + 2, 74));
  const confidenceScore = scoreFromText(combinedAnswers, Math.max(averageScore - 2, 68));
  const overallScore = Math.round((communicationScore + knowledgeScore + confidenceScore) / 3);
  const summary =
    overallScore >= 80
      ? "Candidate communicated clearly, grounded answers in outcomes, and showed strong role readiness."
      : overallScore >= 68
        ? "Candidate showed workable interview signal with enough depth for a structured follow-up round."
        : "Candidate showed mixed interview signal and needs deeper human validation before advancing.";

  return {
    communicationScore,
    knowledgeScore,
    confidenceScore,
    overallScore,
    summary,
    claimVerificationFlags: [
      { claim: "Led a major initiative", status: "VERIFY_REFERENCE" },
      { claim: "Improved KPI by double digits", status: "LIKELY_TRUE" }
    ],
    suggestedManagerQuestions: [
      "Which part of the candidate's execution system would break first at our scale?",
      "How do they distinguish signal from noise when early metrics move?"
    ],
    answerEvaluations
  };
}
