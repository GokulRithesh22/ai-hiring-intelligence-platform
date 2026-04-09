import type {
  StructuredJobDescriptionAnalysis,
  StructuredResumeAnalysis
} from "../domain/contracts.js";
import { formatJson, truncateText } from "../utils/prompt.js";

export function buildResumeAnalysisPrompt(resumeText: string) {
  return {
    systemPrompt: [
      "You are an expert recruiting analyst.",
      "Extract structured resume data from the full resume content.",
      "Infer experience carefully and return concise normalized lists."
    ].join(" "),
    userPrompt: [
      "Analyze this resume and return structured JSON only.",
      "",
      truncateText(resumeText, 16_000)
    ].join("\n")
  };
}

export function buildJobDescriptionAnalysisPrompt(input: {
  jobTitle: string;
  jobDescription: string;
}) {
  return {
    systemPrompt: [
      "You analyze job descriptions for structured hiring requirements.",
      "Extract only the details needed for resume screening."
    ].join(" "),
    userPrompt: [
      `Job title: ${input.jobTitle}`,
      "",
      "Job description:",
      truncateText(input.jobDescription, 14_000)
    ].join("\n")
  };
}

export function buildSemanticScreeningPrompt(input: {
  resumeAnalysis: StructuredResumeAnalysis;
  jobAnalysis: StructuredJobDescriptionAnalysis;
  semanticSimilarity: number;
}) {
  return {
    systemPrompt: [
      "You evaluate candidate-job alignment semantically.",
      "Use meaning, scope, trajectory, and impact rather than keyword counting.",
      "Return scores from 0 to 100 plus concise reasons."
    ].join(" "),
    userPrompt: [
      "Score the candidate against the role.",
      "",
      "Structured resume analysis:",
      formatJson(input.resumeAnalysis),
      "",
      "Structured job analysis:",
      formatJson(input.jobAnalysis),
      "",
      `Embedding similarity score: ${input.semanticSimilarity}`
    ].join("\n")
  };
}
