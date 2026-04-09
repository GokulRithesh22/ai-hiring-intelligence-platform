import { scoreFromText } from "../utils/mock.js";

export interface ResumeScreeningRequest {
  jobDescription: string;
  resumeText: string;
  linkedinUrl?: string;
}

export interface ResumeScreeningResult {
  matchScore: number;
  strengths: string[];
  gaps: string[];
  decision: "PROCEED" | "STOP";
  explanation: string;
}

export async function screenResume(
  request: ResumeScreeningRequest
): Promise<ResumeScreeningResult> {
  const combined = `${request.jobDescription} ${request.resumeText}`;
  const matchScore = scoreFromText(combined, 68);

  return {
    matchScore,
    strengths: ["Relevant role keywords detected", "Professional experience aligns with required scope"],
    gaps: matchScore < 75 ? ["Some required tools or scale markers are missing"] : [],
    decision: matchScore >= 70 ? "PROCEED" : "STOP",
    explanation:
      matchScore >= 70
        ? "Resume matches the role expectations strongly enough to proceed to qualification."
        : "Candidate profile is stored, but the resume does not meet the minimum threshold to advance."
  };
}
