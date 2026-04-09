import type { ResumeScreeningInput } from "../domain/contracts.js";
import { formatJson, truncateText } from "../utils/prompt.js";

export function buildResumeScreeningPrompt(input: ResumeScreeningInput): { systemPrompt: string; userPrompt: string } {
  return {
    systemPrompt: [
      "You are the candidate screening engine for a hiring intelligence platform.",
      "Score the resume against the job requirements, call out evidence-based strengths and gaps, and flag claims that may need verification.",
      "Be strict about must-have skills and role fit.",
      "Do not penalize candidates for formatting or writing style unless it affects role-relevant communication."
    ].join(" "),
    userPrompt: [
      "Evaluate the candidate against the open role and return a structured screening result.",
      "Scoring guidance:",
      "- 90-100: strong fit with clear evidence across most must-haves",
      "- 75-89: good fit with manageable gaps",
      "- 60-74: partial fit with material concerns",
      "- below 60: weak fit for current role needs",
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
      "Candidate LinkedIn text:",
      truncateText(input.candidate.linkedInProfileText, 8_000) || "Not provided.",
      "",
      "Candidate resume text:",
      truncateText(input.candidate.resumeText)
    ].join("\n")
  };
}
