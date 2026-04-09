import { loadAiServiceConfig } from "../config/env.js";
import type {
  SemanticScreeningBreakdown,
  StructuredJobDescriptionAnalysis,
  StructuredResumeAnalysis
} from "../domain/contracts.js";
import {
  semanticScreeningBreakdownSchema,
  structuredJobDescriptionAnalysisSchema,
  structuredResumeAnalysisSchema
} from "../domain/contracts.js";
import {
  createMockSemanticScreeningBreakdown,
  createMockStructuredJobDescriptionAnalysis,
  createMockStructuredResumeAnalysis
} from "../mocks/mock-generators.js";
import {
  buildJobDescriptionAnalysisPrompt,
  buildResumeAnalysisPrompt,
  buildSemanticScreeningPrompt
} from "../prompts/semantic-screening.js";
import { createOpenAIClient } from "../providers/openai-client.js";
import { createStructuredAiProvider } from "../providers/index.js";

export interface ResumeScreeningRequest {
  jobTitle?: string;
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
  semanticSimilarity: number;
  experienceMatch: number;
  skillsMatch: number;
  domainMatch: number;
  achievementsMatch: number;
  resumeAnalysis: StructuredResumeAnalysis;
  jobAnalysis: StructuredJobDescriptionAnalysis;
}

export async function analyzeStructuredResume(
  resumeText: string
): Promise<StructuredResumeAnalysis> {
  const config = loadAiServiceConfig();
  const provider = createStructuredAiProvider(config);
  const prompt = buildResumeAnalysisPrompt(resumeText);
  const response = await provider.generateObject({
    taskName: "structured_resume_analysis",
    systemPrompt: prompt.systemPrompt,
    userPrompt: prompt.userPrompt,
    outputSchema: structuredResumeAnalysisSchema,
    modelProfile: "extraction",
    reasoningEffort: "low",
    mockFactory: () => createMockStructuredResumeAnalysis(resumeText)
  });

  return structuredResumeAnalysisSchema.parse(response.data);
}

export async function analyzeStructuredJobDescription(input: {
  jobTitle: string;
  jobDescription: string;
}): Promise<StructuredJobDescriptionAnalysis> {
  const config = loadAiServiceConfig();
  const provider = createStructuredAiProvider(config);
  const prompt = buildJobDescriptionAnalysisPrompt(input);
  const response = await provider.generateObject({
    taskName: "structured_job_description_analysis",
    systemPrompt: prompt.systemPrompt,
    userPrompt: prompt.userPrompt,
    outputSchema: structuredJobDescriptionAnalysisSchema,
    modelProfile: "extraction",
    reasoningEffort: "low",
    mockFactory: () => createMockStructuredJobDescriptionAnalysis(input)
  });

  return structuredJobDescriptionAnalysisSchema.parse(response.data);
}

export async function screenResume(
  request: ResumeScreeningRequest
): Promise<ResumeScreeningResult> {
  const config = loadAiServiceConfig();
  const provider = createStructuredAiProvider(config);

  const resumeAnalysis = await analyzeStructuredResume(request.resumeText);
  const jobAnalysis = await analyzeStructuredJobDescription({
    jobTitle: request.jobTitle ?? "Open role",
    jobDescription: request.jobDescription
  });

  const semanticSimilarity = await computeSemanticSimilarity(
    request.resumeText,
    request.jobDescription,
    config.embeddingModel
  );

  const prompt = buildSemanticScreeningPrompt({
    resumeAnalysis,
    jobAnalysis,
    semanticSimilarity
  });
  const breakdownResponse = await provider.generateObject({
    taskName: "semantic_resume_screening_breakdown",
    systemPrompt: prompt.systemPrompt,
    userPrompt: prompt.userPrompt,
    outputSchema: semanticScreeningBreakdownSchema,
    modelProfile: "primary",
    reasoningEffort: "medium",
    mockFactory: () => createMockSemanticScreeningBreakdown({
      resumeAnalysis,
      jobAnalysis,
      semanticSimilarity
    })
  });

  const breakdown = semanticScreeningBreakdownSchema.parse(breakdownResponse.data);
  const finalScore = clampScore(
    breakdown.experienceMatch * 0.3 +
      breakdown.skillsMatch * 0.3 +
      breakdown.domainMatch * 0.2 +
      breakdown.achievementsMatch * 0.2
  );

  return {
    matchScore: finalScore,
    strengths: breakdown.strengths,
    gaps: breakdown.weaknesses,
    decision: finalScore >= 70 ? "PROCEED" : "STOP",
    explanation: breakdown.reasoningSummary,
    semanticSimilarity,
    experienceMatch: breakdown.experienceMatch,
    skillsMatch: breakdown.skillsMatch,
    domainMatch: breakdown.domainMatch,
    achievementsMatch: breakdown.achievementsMatch,
    resumeAnalysis,
    jobAnalysis
  };
}

async function computeSemanticSimilarity(
  resumeText: string,
  jobDescription: string,
  embeddingModel: string
): Promise<number> {
  try {
    const client = createOpenAIClient();
    if (!client) {
      return fallbackSimilarity(resumeText, jobDescription);
    }

    const [resumeEmbedding, jobEmbedding] = await Promise.all([
      client.embeddings.create({
        model: embeddingModel,
        input: resumeText.slice(0, 8_000)
      }),
      client.embeddings.create({
        model: embeddingModel,
        input: jobDescription.slice(0, 8_000)
      })
    ]);

    const resumeVector = resumeEmbedding.data[0]?.embedding;
    const jobVector = jobEmbedding.data[0]?.embedding;

    if (!resumeVector || !jobVector || resumeVector.length !== jobVector.length) {
      return fallbackSimilarity(resumeText, jobDescription);
    }

    const cosine = cosineSimilarity(resumeVector, jobVector);
    return clampScore(((cosine + 1) / 2) * 100);
  } catch {
    return fallbackSimilarity(resumeText, jobDescription);
  }
}

function cosineSimilarity(vectorA: number[], vectorB: number[]): number {
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let index = 0; index < vectorA.length; index += 1) {
    const valueA = vectorA[index] ?? 0;
    const valueB = vectorB[index] ?? 0;
    dotProduct += valueA * valueB;
    magnitudeA += valueA * valueA;
    magnitudeB += valueB * valueB;
  }

  if (!magnitudeA || !magnitudeB) {
    return 0;
  }

  return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
}

function fallbackSimilarity(resumeText: string, jobDescription: string): number {
  const resumeTerms = new Set(normalizeText(resumeText));
  const jobTerms = new Set(normalizeText(jobDescription));
  const overlap = [...jobTerms].filter((term) => resumeTerms.has(term)).length;
  const denominator = Math.max(1, Math.min(jobTerms.size, 25));
  return clampScore((overlap / denominator) * 100);
}

function normalizeText(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length >= 4)
    .slice(0, 400);
}

function clampScore(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(value)));
}
