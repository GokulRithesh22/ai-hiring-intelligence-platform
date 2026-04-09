import type { JobIntakeInput } from "../domain/contracts.js";
import { formatJson } from "../utils/prompt.js";

export function buildJobDescriptionPrompt(input: JobIntakeInput): { systemPrompt: string; userPrompt: string } {
  return {
    systemPrompt: [
      "You write structured, realistic SaaS job descriptions for a recruiting platform.",
      "Balance ambition with hiring clarity.",
      "Avoid generic filler and make the screening criteria measurable.",
      "Use the provided intake details only; do not invent compensation or policy details that are absent."
    ].join(" "),
    userPrompt: [
      "Generate a production-ready job description draft from the structured intake below.",
      "The role should be clear enough for HR approval, LinkedIn posting, and AI resume screening.",
      "Focus especially on the problem statement, responsibilities, required skills, preferred skills, and interview focus areas.",
      "",
      "Structured intake:",
      formatJson(input)
    ].join("\n")
  };
}
