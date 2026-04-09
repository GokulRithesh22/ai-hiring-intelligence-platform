import type { InterviewEvaluationInput, InterviewQuestionGenerationInput } from "../domain/contracts.js";
import { formatJson, truncateText } from "../utils/prompt.js";

export function buildInterviewQuestionPrompt(input: InterviewQuestionGenerationInput): { systemPrompt: string; userPrompt: string } {
  return {
    systemPrompt: [
      "You generate structured AI interview questions for recruiting workflows.",
      "Questions must be grounded in the candidate's background and the role's actual requirements.",
      "Avoid trivia and generic prompts; each question should test a concrete hiring signal."
    ].join(" "),
    userPrompt: [
      `Create ${input.questionCount} interview questions for this candidate.`,
      "Blend technical depth, problem solving, and communication.",
      "Use the provided focus areas when available, otherwise infer them from the role requirements and resume.",
      "",
      "Job context:",
      formatJson(input.job),
      "",
      "Candidate profile:",
      formatJson({
        candidateId: input.candidate.candidateId,
        fullName: input.candidate.fullName,
        currentTitle: input.candidate.currentTitle,
        yearsOfExperience: input.candidate.yearsOfExperience,
        linkedInUrl: input.candidate.linkedInUrl
      }),
      "",
      "Requested focus areas:",
      formatJson(input.focusAreas),
      "",
      "Resume text:",
      truncateText(input.candidate.resumeText, 16_000)
    ].join("\n")
  };
}

export function buildInterviewEvaluationPrompt(input: InterviewEvaluationInput): { systemPrompt: string; userPrompt: string } {
  return {
    systemPrompt: [
      "You are evaluating an AI interview for a hiring intelligence platform.",
      "Assess communication, role knowledge, and confidence separately.",
      "Score answers consistently and ground every judgment in the transcript.",
      "Do not inflate scores to be polite."
    ].join(" "),
    userPrompt: [
      "Evaluate the candidate interview and return a structured scorecard.",
      "Use these anchors:",
      "- 85+: strong and specific evidence",
      "- 70-84: mostly solid with some gaps",
      "- 50-69: mixed signal",
      "- below 50: weak evidence for this role",
      "",
      "Job context:",
      formatJson(input.job),
      "",
      "Candidate profile:",
      formatJson({
        candidateId: input.candidate.candidateId,
        fullName: input.candidate.fullName,
        currentTitle: input.candidate.currentTitle
      }),
      "",
      "Interview answers:",
      formatJson(input.answers)
    ].join("\n")
  };
}
