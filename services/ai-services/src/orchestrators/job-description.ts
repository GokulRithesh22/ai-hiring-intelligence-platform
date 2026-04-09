import { jdPrompt } from "../prompts/templates.js";

export interface JobDescriptionRequest {
  title: string;
  intakeAnswers: Array<{ prompt: string; answer: string }>;
}

export interface JobDescriptionResult {
  description: string;
  interviewFocusAreas: string[];
}

export async function generateJobDescription(
  request: JobDescriptionRequest
): Promise<JobDescriptionResult> {
  const synthesizedAnswers = request.intakeAnswers
    .map((answer) => `${answer.prompt}: ${answer.answer}`)
    .join("\n");

  return {
    description: `${request.title}\n\n${jdPrompt}\n\n${synthesizedAnswers}\n\nResponsibilities:\n- Own measurable outcomes\n- Collaborate across hiring stakeholders\n- Drive high-quality execution\n\nRequirements:\n- Relevant domain experience\n- Strong written and verbal communication\n- Operational rigor and stakeholder alignment`,
    interviewFocusAreas: ["Problem solving", "Execution depth", "Cross-functional leadership"]
  };
}
