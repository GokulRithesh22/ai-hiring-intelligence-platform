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
  const combinedAnswers = request.questions.map((item) => item.answer).join(" ");
  const communicationScore = scoreFromText(combinedAnswers, 78);
  const knowledgeScore = scoreFromText(combinedAnswers, 80);
  const confidenceScore = scoreFromText(combinedAnswers, 75);
  const overallScore = Math.round((communicationScore + knowledgeScore + confidenceScore) / 3);

  return {
    communicationScore,
    knowledgeScore,
    confidenceScore,
    overallScore,
    summary:
      "Candidate communicated clearly, showed practical role knowledge, and demonstrated enough confidence to recommend a human follow-up round.",
    claimVerificationFlags: [
      { claim: "Led a major initiative", status: "VERIFY_REFERENCE" },
      { claim: "Improved KPI by double digits", status: "LIKELY_TRUE" }
    ],
    suggestedManagerQuestions: [
      "Which part of the candidate's execution system would break first at our scale?",
      "How do they distinguish signal from noise when early metrics move?"
    ]
  };
}
