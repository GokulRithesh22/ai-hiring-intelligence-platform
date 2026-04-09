import type {
  CandidateIntelligenceReportInput,
  ManagerQuestionSuggestionInput
} from "../domain/contracts.js";
import { formatJson, truncateText } from "../utils/prompt.js";

export function buildCandidateIntelligenceReportPrompt(
  input: CandidateIntelligenceReportInput
): { systemPrompt: string; userPrompt: string } {
  return {
    systemPrompt: [
      "You assemble candidate intelligence reports for hiring managers.",
      "Summaries must be concise, evidence-based, and useful for decision making.",
      "Balance the resume, LinkedIn context, interview signal, qualification gate, and prior application history."
    ].join(" "),
    userPrompt: [
      "Create a manager-ready candidate intelligence report.",
      "Highlight what matters most for the current role and recommend the best next step.",
      "",
      "Candidate:",
      formatJson({
        candidateId: input.candidate.candidateId,
        fullName: input.candidate.fullName,
        currentTitle: input.candidate.currentTitle,
        yearsOfExperience: input.candidate.yearsOfExperience,
        linkedInUrl: input.candidate.linkedInUrl
      }),
      "",
      "Resume text:",
      truncateText(input.candidate.resumeText, 12_000),
      "",
      "LinkedIn text:",
      truncateText(input.candidate.linkedInProfileText, 8_000) || "Not provided.",
      "",
      "Job context:",
      formatJson(input.job),
      "",
      "Resume screening:",
      formatJson(input.resumeScreening),
      "",
      "Qualification evaluation:",
      formatJson(input.qualificationEvaluation),
      "",
      "Interview evaluation:",
      formatJson(input.interviewEvaluation ?? null),
      "",
      "Application history:",
      formatJson(input.applicationHistory)
    ].join("\n")
  };
}

export function buildManagerQuestionSuggestionPrompt(
  input: ManagerQuestionSuggestionInput
): { systemPrompt: string; userPrompt: string } {
  return {
    systemPrompt: [
      "You prepare hiring managers for the live interview stage.",
      "Create targeted follow-up questions that validate strengths, probe risks, and test claims that need evidence.",
      "Each question should help the manager learn something decision-critical."
    ].join(" "),
    userPrompt: [
      `Generate ${input.requestedCount} follow-up interview questions for the hiring manager.`,
      "Favor questions that test the candidate's likely weak spots, role-specific depth, or ambiguous claims.",
      "",
      "Job context:",
      formatJson(input.job),
      "",
      "Candidate profile:",
      formatJson({
        candidateId: input.candidate.candidateId,
        fullName: input.candidate.fullName,
        currentTitle: input.candidate.currentTitle,
        yearsOfExperience: input.candidate.yearsOfExperience
      }),
      "",
      "Resume screening:",
      formatJson(input.resumeScreening),
      "",
      "Interview evaluation:",
      formatJson(input.interviewEvaluation ?? null)
    ].join("\n")
  };
}
