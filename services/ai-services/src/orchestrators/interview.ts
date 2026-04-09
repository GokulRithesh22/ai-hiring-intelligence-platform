import type {
  StructuredJobDescriptionAnalysis,
  StructuredResumeAnalysis
} from "../domain/contracts.js";
import { scoreFromText } from "../utils/mock.js";

export interface InterviewQuestionRequest {
  jobTitle: string;
  jobDescription: string;
  resumeSummary: string;
  resumeAnalysis?: Partial<StructuredResumeAnalysis>;
  jobAnalysis?: Partial<StructuredJobDescriptionAnalysis>;
  screening?: {
    strengths?: string[];
    weaknesses?: string[];
  };
}

export interface InterviewEvaluationRequest {
  questions: Array<{ question: string; answer: string }>;
}

export async function generateInterviewQuestions(request: InterviewQuestionRequest) {
  const resumeAnalysis = request.resumeAnalysis ?? {};
  const jobAnalysis = request.jobAnalysis ?? {};
  const screening = request.screening ?? {};

  const primaryRole = resumeAnalysis.roles?.[0]?.trim();
  const primarySkill =
    firstNonEmpty(jobAnalysis.requiredSkills) ??
    firstNonEmpty(resumeAnalysis.skills) ??
    inferCapabilityFromDescription(request.jobDescription) ??
    "the core capability this role depends on";
  const preferredSkill =
    firstNonEmpty(jobAnalysis.preferredSkills) ??
    nthNonEmpty(jobAnalysis.requiredSkills, 1) ??
    nthNonEmpty(resumeAnalysis.skills, 1) ??
    "cross-functional decision-making";
  const domain =
    firstNonEmpty(jobAnalysis.domain) ??
    inferDomainFromDescription(request.jobDescription) ??
    request.jobTitle;
  const tool =
    firstNonEmpty(jobAnalysis.toolsRequired) ??
    firstNonEmpty(resumeAnalysis.toolsUsed) ??
    "your usual operating stack";
  const gap =
    firstNonEmpty(screening.weaknesses) ??
    `depth in ${preferredSkill}`;
  const strength =
    firstNonEmpty(screening.strengths) ??
    firstNonEmpty(resumeAnalysis.achievements) ??
    `your experience in ${domain}`;
  const achievement =
    firstNonEmpty(resumeAnalysis.achievements) ??
    "a result you owned personally";

  return [
    `Your resume suggests experience around ${strength}. Which project best shows you are ready for this ${request.jobTitle} role, and what outcome did you personally drive?`,
    `This role depends on strong ${primarySkill}. Walk me through a real example where you used ${primarySkill} in depth, including the decisions you made and how you measured success.`,
    `One possible gap from the screening pass is ${gap}. Tell me about a time you had to solve a hard problem in that area or close a similar gap quickly.`,
    `If you joined as ${request.jobTitle}, how would you use ${tool} in your first 30 days to improve results in ${domain}, and which metrics would you watch first?`,
    `You mentioned ${achievement}. When priorities conflicted across teams, how did you align people, make trade-offs, and still move the business forward?`
  ];
}

function firstNonEmpty(values?: string[]) {
  return values?.map((value) => value.trim()).find(Boolean) ?? null;
}

function nthNonEmpty(values: string[] | undefined, index: number) {
  return values?.map((value) => value.trim()).filter(Boolean)[index] ?? null;
}

function inferCapabilityFromDescription(jobDescription: string) {
  const lowered = jobDescription.toLowerCase();
  if (lowered.includes("growth")) return "growth experimentation";
  if (lowered.includes("lifecycle")) return "lifecycle execution";
  if (lowered.includes("product")) return "product judgment";
  if (lowered.includes("sales")) return "commercial execution";
  if (lowered.includes("marketing")) return "performance marketing";
  return null;
}

function inferDomainFromDescription(jobDescription: string) {
  const lowered = jobDescription.toLowerCase();
  if (lowered.includes("saas")) return "B2B SaaS";
  if (lowered.includes("fintech")) return "fintech";
  if (lowered.includes("health")) return "healthcare";
  if (lowered.includes("ecommerce")) return "e-commerce";
  return null;
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
