import { loadAiServiceConfig, type AiServiceConfig } from "../config/env.js";
import {
  candidateIntelligenceReportSchema,
  generatedJobDescriptionSchema,
  interviewEvaluationResultSchema,
  interviewQuestionSetSchema,
  jobIntakeConversationResultSchema,
  managerQuestionSuggestionSchema,
  qualificationEvaluationInputSchema,
  qualificationEvaluationResultSchema,
  resumeScreeningInputSchema,
  resumeScreeningResultSchema,
  type CandidateIntelligenceReport,
  type CandidateIntelligenceReportInput,
  type GeneratedJobDescription,
  type InterviewEvaluationInput,
  type InterviewEvaluationResult,
  type InterviewQuestionGenerationInput,
  type InterviewQuestionSet,
  type JobIntakeConversationResult,
  type JobIntakeInput,
  type ManagerQuestionSuggestionInput,
  type ManagerQuestionSuggestionResult,
  type QualificationEvaluationInput,
  type QualificationEvaluationResult,
  type ResumeScreeningInput,
  type ResumeScreeningResult
} from "../domain/contracts.js";
import {
  createMockCandidateIntelligenceReport,
  createMockInterviewEvaluationResult,
  createMockInterviewQuestionSet,
  createMockJobDescription,
  createMockJobIntakeConversationResult,
  createMockManagerQuestionSuggestions,
  createMockResumeScreeningResult,
  createQualificationSummary
} from "../mocks/mock-generators.js";
import { buildJobDescriptionPrompt } from "../prompts/job-description.js";
import { buildJobIntakeConversationPrompt } from "../prompts/intake.js";
import { buildInterviewEvaluationPrompt, buildInterviewQuestionPrompt } from "../prompts/interview.js";
import { buildCandidateIntelligenceReportPrompt, buildManagerQuestionSuggestionPrompt } from "../prompts/reporting.js";
import { buildResumeScreeningPrompt } from "../prompts/resume-screening.js";
import { createStructuredAiProvider, type StructuredAiProvider, type StructuredAiResponse } from "../providers/index.js";
import { clampScore } from "../utils/prompt.js";

export interface ScreeningPipelineInput {
  resumeScreening: ResumeScreeningInput;
  qualificationEvaluation: QualificationEvaluationInput;
}

export interface ScreeningPipelineResult {
  resumeScreening: StructuredAiResponse<ResumeScreeningResult>;
  qualificationEvaluation: QualificationEvaluationResult;
  nextStage: "rejected_after_resume" | "rejected_after_qualification" | "proceed_to_ai_interview";
}

export class AIHiringIntelligenceService {
  constructor(
    private readonly provider: StructuredAiProvider,
    private readonly config: AiServiceConfig
  ) {}

  async continueJobIntakeConversation(input: JobIntakeInput): Promise<StructuredAiResponse<JobIntakeConversationResult>> {
    const prompt = buildJobIntakeConversationPrompt(input);

    return this.provider.generateObject({
      taskName: "job_intake_conversation",
      systemPrompt: prompt.systemPrompt,
      userPrompt: prompt.userPrompt,
      outputSchema: jobIntakeConversationResultSchema,
      modelProfile: "fast",
      reasoningEffort: "minimal",
      mockFactory: () => createMockJobIntakeConversationResult(input)
    });
  }

  async generateJobDescription(input: JobIntakeInput): Promise<StructuredAiResponse<GeneratedJobDescription>> {
    const prompt = buildJobDescriptionPrompt(input);

    return this.provider.generateObject({
      taskName: "job_description_draft",
      systemPrompt: prompt.systemPrompt,
      userPrompt: prompt.userPrompt,
      outputSchema: generatedJobDescriptionSchema,
      modelProfile: "primary",
      reasoningEffort: "medium",
      mockFactory: () => createMockJobDescription(input)
    });
  }

  async screenCandidateResume(input: ResumeScreeningInput): Promise<StructuredAiResponse<ResumeScreeningResult>> {
    const validatedInput = resumeScreeningInputSchema.parse(input);
    const prompt = buildResumeScreeningPrompt(validatedInput);
    const result = await this.provider.generateObject({
      taskName: "resume_screening",
      systemPrompt: prompt.systemPrompt,
      userPrompt: prompt.userPrompt,
      outputSchema: resumeScreeningResultSchema,
      modelProfile: "fast",
      reasoningEffort: "low",
      mockFactory: () => createMockResumeScreeningResult(validatedInput, this.config.resumePassThreshold)
    });

    const normalized = resumeScreeningResultSchema.parse({
      ...result.data,
      matchScore: clampScore(result.data.matchScore),
      proceed: result.data.matchScore >= this.config.resumePassThreshold,
      recommendation: result.data.matchScore >= this.config.resumePassThreshold
        ? result.data.recommendation === "reject" ? "hold" : result.data.recommendation
        : "reject"
    });

    return {
      ...result,
      data: normalized
    };
  }

  evaluateCandidateQualifications(input: QualificationEvaluationInput): QualificationEvaluationResult {
    const validatedInput = qualificationEvaluationInputSchema.parse(input);
    return qualificationEvaluationResultSchema.parse(createQualificationSummary(validatedInput));
  }

  async generateInterviewQuestionSet(
    input: InterviewQuestionGenerationInput
  ): Promise<StructuredAiResponse<InterviewQuestionSet>> {
    const prompt = buildInterviewQuestionPrompt(input);

    return this.provider.generateObject({
      taskName: "interview_question_generation",
      systemPrompt: prompt.systemPrompt,
      userPrompt: prompt.userPrompt,
      outputSchema: interviewQuestionSetSchema,
      modelProfile: "primary",
      reasoningEffort: "medium",
      mockFactory: () => createMockInterviewQuestionSet(input)
    });
  }

  async evaluateInterview(
    input: InterviewEvaluationInput
  ): Promise<StructuredAiResponse<InterviewEvaluationResult>> {
    const prompt = buildInterviewEvaluationPrompt(input);
    const result = await this.provider.generateObject({
      taskName: "interview_evaluation",
      systemPrompt: prompt.systemPrompt,
      userPrompt: prompt.userPrompt,
      outputSchema: interviewEvaluationResultSchema,
      modelProfile: "primary",
      reasoningEffort: "medium",
      mockFactory: () => createMockInterviewEvaluationResult(input)
    });

    return {
      ...result,
      data: interviewEvaluationResultSchema.parse({
        ...result.data,
        communicationScore: clampScore(result.data.communicationScore),
        knowledgeScore: clampScore(result.data.knowledgeScore),
        confidenceScore: clampScore(result.data.confidenceScore),
        overallScore: clampScore(result.data.overallScore),
        answerEvaluations: result.data.answerEvaluations.map((item) => ({
          ...item,
          score: clampScore(item.score)
        }))
      })
    };
  }

  async assembleCandidateIntelligenceReport(
    input: CandidateIntelligenceReportInput
  ): Promise<StructuredAiResponse<CandidateIntelligenceReport>> {
    const prompt = buildCandidateIntelligenceReportPrompt(input);

    return this.provider.generateObject({
      taskName: "candidate_intelligence_report",
      systemPrompt: prompt.systemPrompt,
      userPrompt: prompt.userPrompt,
      outputSchema: candidateIntelligenceReportSchema,
      modelProfile: "primary",
      reasoningEffort: "medium",
      mockFactory: () => createMockCandidateIntelligenceReport(input)
    });
  }

  async suggestManagerInterviewQuestions(
    input: ManagerQuestionSuggestionInput
  ): Promise<StructuredAiResponse<ManagerQuestionSuggestionResult>> {
    const prompt = buildManagerQuestionSuggestionPrompt(input);

    return this.provider.generateObject({
      taskName: "manager_interview_question_suggestions",
      systemPrompt: prompt.systemPrompt,
      userPrompt: prompt.userPrompt,
      outputSchema: managerQuestionSuggestionSchema,
      modelProfile: "fast",
      reasoningEffort: "low",
      mockFactory: () => createMockManagerQuestionSuggestions(input)
    });
  }

  async runScreeningPipeline(input: ScreeningPipelineInput): Promise<ScreeningPipelineResult> {
    const resumeScreening = await this.screenCandidateResume(input.resumeScreening);
    if (!resumeScreening.data.proceed) {
      return {
        resumeScreening,
        qualificationEvaluation: this.evaluateCandidateQualifications(input.qualificationEvaluation),
        nextStage: "rejected_after_resume"
      };
    }

    const qualificationEvaluation = this.evaluateCandidateQualifications(input.qualificationEvaluation);
    if (!qualificationEvaluation.qualified) {
      return {
        resumeScreening,
        qualificationEvaluation,
        nextStage: "rejected_after_qualification"
      };
    }

    return {
      resumeScreening,
      qualificationEvaluation,
      nextStage: "proceed_to_ai_interview"
    };
  }
}

export function createAIHiringIntelligenceService(config: AiServiceConfig = loadAiServiceConfig()): AIHiringIntelligenceService {
  return new AIHiringIntelligenceService(createStructuredAiProvider(config), config);
}
