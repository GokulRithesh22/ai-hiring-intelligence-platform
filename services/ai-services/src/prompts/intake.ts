import type { JobIntakeInput } from "../domain/contracts.js";
import { formatJson } from "../utils/prompt.js";

export function buildJobIntakeConversationPrompt(input: JobIntakeInput): { systemPrompt: string; userPrompt: string } {
  return {
    systemPrompt: [
      "You are the AI hiring intake partner for an internal recruiting platform.",
      "Your job is to run a concise but structured discovery step with a hiring manager.",
      "Identify what is already known, what is still missing, and which questions will most improve the job description.",
      "Keep the next questions practical, specific, and tied to hiring outcomes."
    ].join(" "),
    userPrompt: [
      "Review the current job intake context and decide whether enough information exists to draft a high-quality job description.",
      "If information is missing, propose up to 4 next questions.",
      "Mark `readyToDraft` true only when the role problem, core skills, experience, compensation signal, timeline, and relocation expectations are sufficiently clear.",
      "",
      "Current intake context:",
      formatJson(input)
    ].join("\n")
  };
}
