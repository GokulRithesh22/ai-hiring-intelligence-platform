import { z } from "zod";

export const employmentTypeSchema = z.enum(["full_time", "part_time", "contract", "internship"]);
export const workModelSchema = z.enum(["remote", "hybrid", "onsite"]);
export const experienceLevelSchema = z.enum(["entry", "mid", "mid_senior", "senior", "lead", "executive"]);
export const recommendationSchema = z.enum(["advance", "hold", "reject"]);
export const relocationSchema = z.enum(["yes", "no", "negotiable"]);

export const salaryRangeSchema = z.object({
  currency: z.string().default("USD"),
  minAnnualBase: z.number().nonnegative().nullable().optional(),
  maxAnnualBase: z.number().nonnegative().nullable().optional(),
  notes: z.string().optional()
});

export const conversationTurnSchema = z.object({
  role: z.enum(["manager", "ai"]),
  content: z.string().min(1)
});

export const jobIntakeInputSchema = z.object({
  jobTitle: z.string().min(2),
  companyName: z.string().optional(),
  department: z.string().optional(),
  location: z.string().optional(),
  employmentType: employmentTypeSchema.default("full_time"),
  workModel: workModelSchema.default("hybrid"),
  businessProblem: z.string().optional(),
  responsibilities: z.array(z.string()).default([]),
  requiredSkills: z.array(z.string()).default([]),
  preferredSkills: z.array(z.string()).default([]),
  experienceLevel: experienceLevelSchema.default("mid"),
  salaryRange: salaryRangeSchema.optional(),
  joiningTimeline: z.string().optional(),
  relocationRequired: z.boolean().default(false),
  relocationDetails: z.string().optional(),
  teamContext: z.string().optional(),
  successOutcomes: z.array(z.string()).default([]),
  mustHaveRequirements: z.array(z.string()).default([]),
  niceToHaveRequirements: z.array(z.string()).default([]),
  interviewerNotes: z.string().optional(),
  conversationHistory: z.array(conversationTurnSchema).default([])
});

export const jobIntakeConversationResultSchema = z.object({
  intakeSummary: z.string(),
  capturedRequirements: z.object({
    businessProblem: z.string().default(""),
    responsibilities: z.array(z.string()).default([]),
    requiredSkills: z.array(z.string()).default([]),
    preferredSkills: z.array(z.string()).default([]),
    experienceLevel: experienceLevelSchema,
    salaryKnown: z.boolean(),
    joiningTimelineKnown: z.boolean(),
    relocationKnown: z.boolean()
  }),
  missingInformation: z.array(z.string()).default([]),
  nextQuestions: z.array(z.object({
    field: z.string(),
    question: z.string(),
    rationale: z.string()
  })).max(4),
  readyToDraft: z.boolean()
});

export const jobScreeningContextSchema = z.object({
  jobId: z.string().optional(),
  title: z.string(),
  summary: z.string(),
  responsibilities: z.array(z.string()).default([]),
  requiredSkills: z.array(z.string()).default([]),
  preferredSkills: z.array(z.string()).default([]),
  experienceLevel: experienceLevelSchema,
  location: z.string().optional(),
  workModel: workModelSchema.default("hybrid"),
  salaryRange: salaryRangeSchema.optional(),
  joiningTimeline: z.string().optional(),
  joiningDeadlineDays: z.number().int().positive().optional(),
  latestStartDate: z.string().optional(),
  relocationRequired: z.boolean().default(false),
  relocationDetails: z.string().optional(),
  mustHaveRequirements: z.array(z.string()).default([]),
  successOutcomes: z.array(z.string()).default([])
});

export const generatedJobDescriptionSchema = z.object({
  title: z.string(),
  summary: z.string(),
  problemStatement: z.string(),
  responsibilities: z.array(z.string()).min(4).max(8),
  requiredSkills: z.array(z.string()).min(3).max(10),
  preferredSkills: z.array(z.string()).default([]),
  experienceLevel: experienceLevelSchema,
  location: z.string().optional(),
  workModel: workModelSchema,
  employmentType: employmentTypeSchema,
  salaryRange: salaryRangeSchema.optional(),
  joiningTimeline: z.string().optional(),
  relocation: z.object({
    required: z.boolean(),
    details: z.string()
  }),
  screeningCriteria: z.array(z.string()).min(3).max(8),
  interviewFocusAreas: z.array(z.string()).min(3).max(6),
  approvalNotes: z.array(z.string()).default([])
});

export const candidateProfileInputSchema = z.object({
  candidateId: z.string(),
  fullName: z.string(),
  email: z.string().email().optional(),
  currentTitle: z.string().optional(),
  yearsOfExperience: z.number().nonnegative().optional(),
  linkedInUrl: z.string().url().optional(),
  linkedInProfileText: z.string().optional(),
  resumeText: z.string().min(20)
});

export const resumeScreeningInputSchema = z.object({
  candidate: candidateProfileInputSchema,
  job: jobScreeningContextSchema
});

export const claimVerificationFlagSchema = z.object({
  claim: z.string(),
  severity: z.enum(["low", "medium", "high"]),
  reason: z.string()
});

export const resumeScreeningResultSchema = z.object({
  candidateSummary: z.string(),
  matchScore: z.number().min(0).max(100),
  proceed: z.boolean(),
  recommendation: recommendationSchema,
  strengths: z.array(z.string()).min(2).max(6),
  gaps: z.array(z.string()).max(6),
  matchedSkills: z.array(z.string()).default([]),
  missingSkills: z.array(z.string()).default([]),
  resumeHighlights: z.array(z.string()).default([]),
  claimVerificationFlags: z.array(claimVerificationFlagSchema).default([])
});

export const structuredResumeAnalysisSchema = z.object({
  experienceYears: z.number().min(0).max(60),
  roles: z.array(z.string()).default([]),
  skills: z.array(z.string()).default([]),
  industries: z.array(z.string()).default([]),
  achievements: z.array(z.string()).default([]),
  toolsUsed: z.array(z.string()).default([]),
  education: z.array(z.string()).default([])
});

export const structuredJobDescriptionAnalysisSchema = z.object({
  requiredExperience: z.number().min(0).max(60),
  requiredSkills: z.array(z.string()).default([]),
  preferredSkills: z.array(z.string()).default([]),
  domain: z.array(z.string()).default([]),
  toolsRequired: z.array(z.string()).default([])
});

export const semanticScreeningBreakdownSchema = z.object({
  experienceMatch: z.number().min(0).max(100),
  skillsMatch: z.number().min(0).max(100),
  domainMatch: z.number().min(0).max(100),
  achievementsMatch: z.number().min(0).max(100),
  strengths: z.array(z.string()).default([]),
  weaknesses: z.array(z.string()).default([]),
  reasoningSummary: z.string()
});

export const qualificationAnswersSchema = z.object({
  joiningTimelineDays: z.number().int().nonnegative().nullable().optional(),
  joiningTimelineText: z.string().optional(),
  expectedAnnualSalary: z.number().nonnegative().nullable().optional(),
  salaryCurrency: z.string().default("USD"),
  relocationWillingness: relocationSchema.default("negotiable"),
  notes: z.string().optional()
});

export const qualificationEvaluationInputSchema = z.object({
  job: jobScreeningContextSchema,
  answers: qualificationAnswersSchema
});

export const qualificationEvaluationResultSchema = z.object({
  qualified: z.boolean(),
  matchedConstraints: z.array(z.string()).default([]),
  mismatchConstraints: z.array(z.string()).default([]),
  blockingReasons: z.array(z.string()).default([]),
  summary: z.string()
});

export const interviewQuestionSchema = z.object({
  id: z.string(),
  question: z.string(),
  competency: z.string(),
  intent: z.string(),
  scoringGuidance: z.string()
});

export const interviewQuestionGenerationInputSchema = z.object({
  candidate: candidateProfileInputSchema,
  job: jobScreeningContextSchema,
  questionCount: z.number().int().min(4).max(6).default(5),
  focusAreas: z.array(z.string()).default([])
});

export const interviewQuestionSetSchema = z.object({
  intro: z.string(),
  questions: z.array(interviewQuestionSchema).min(4).max(6)
});

export const interviewAnswerSchema = z.object({
  questionId: z.string(),
  question: z.string(),
  answer: z.string().min(1)
});

export const interviewEvaluationInputSchema = z.object({
  candidate: candidateProfileInputSchema,
  job: jobScreeningContextSchema,
  answers: z.array(interviewAnswerSchema).min(1)
});

export const interviewAnswerEvaluationSchema = z.object({
  questionId: z.string(),
  score: z.number().min(0).max(100),
  rationale: z.string(),
  evidence: z.array(z.string()).default([])
});

export const interviewEvaluationResultSchema = z.object({
  communicationScore: z.number().min(0).max(100),
  knowledgeScore: z.number().min(0).max(100),
  confidenceScore: z.number().min(0).max(100),
  overallScore: z.number().min(0).max(100),
  interviewSummary: z.string(),
  strengths: z.array(z.string()).min(2).max(6),
  concerns: z.array(z.string()).max(6),
  recommendation: recommendationSchema,
  answerEvaluations: z.array(interviewAnswerEvaluationSchema)
});

export const scoreEvidenceSourceSchema = z.enum(["RESUME", "INTERVIEW", "SCREENING", "SYSTEM"]);

export const scoreEvidenceItemSchema = z.object({
  source: scoreEvidenceSourceSchema,
  signal: z.string(),
  excerpt: z.string()
});

export const candidateScoreComponentSchema = z.object({
  score: z.number().min(0).max(100),
  rationale: z.string(),
  evidence: z.array(scoreEvidenceItemSchema).default([])
});

export const candidateScoringInputSchema = z.object({
  applicationId: z.string(),
  candidateId: z.string(),
  jobId: z.string(),
  jobTitle: z.string(),
  structuredResumeAnalysis: structuredResumeAnalysisSchema,
  structuredJobAnalysis: structuredJobDescriptionAnalysisSchema,
  screening: z.object({
    semanticSimilarity: z.number().min(0).max(100),
    experienceMatch: z.number().min(0).max(100),
    skillsMatch: z.number().min(0).max(100),
    domainMatch: z.number().min(0).max(100),
    achievementsMatch: z.number().min(0).max(100),
    finalScore: z.number().min(0).max(100),
    strengths: z.array(z.string()).default([]),
    weaknesses: z.array(z.string()).default([]),
    reasoningSummary: z.string().nullable().optional()
  }),
  interview: z.object({
    communicationScore: z.number().min(0).max(100),
    knowledgeScore: z.number().min(0).max(100),
    confidenceScore: z.number().min(0).max(100),
    overallScore: z.number().min(0).max(100),
    summary: z.string(),
    answerEvaluations: z.array(interviewAnswerEvaluationSchema).default([]),
    questionAnswerPairs: z.array(interviewAnswerSchema).default([])
  }).optional(),
  qualificationAnswers: qualificationAnswersSchema.optional().nullable(),
  resumeText: z.string().optional()
});

export const candidateScoringResultSchema = z.object({
  roleCapability: candidateScoreComponentSchema,
  thinkingBehavior: candidateScoreComponentSchema,
  impact: candidateScoreComponentSchema,
  transferability: candidateScoreComponentSchema,
  potential: candidateScoreComponentSchema,
  finalScore: z.number().min(0).max(100),
  confidenceScore: z.number().min(0).max(1),
  confidenceLabel: z.enum(["HIGH", "MEDIUM", "LOW"]),
  confidenceInterpretation: z.string(),
  summary: z.string(),
  recommendation: recommendationSchema,
  evidenceSummary: z.array(z.string()).default([])
});

export const applicationHistoryEntrySchema = z.object({
  jobTitle: z.string(),
  appliedAt: z.string(),
  status: z.string(),
  resumeScore: z.number().min(0).max(100).optional(),
  interviewScore: z.number().min(0).max(100).optional()
});

export const candidateIntelligenceReportInputSchema = z.object({
  candidate: candidateProfileInputSchema,
  job: jobScreeningContextSchema,
  resumeScreening: resumeScreeningResultSchema,
  qualificationEvaluation: qualificationEvaluationResultSchema,
  interviewEvaluation: interviewEvaluationResultSchema.optional(),
  applicationHistory: z.array(applicationHistoryEntrySchema).default([])
});

export const candidateIntelligenceReportSchema = z.object({
  overview: z.string(),
  resumeInsights: z.array(z.string()).min(2).max(6),
  linkedInInsights: z.array(z.string()).default([]),
  interviewTranscriptSummary: z.array(z.string()).default([]),
  interviewScores: z.object({
    communicationScore: z.number().min(0).max(100).nullable(),
    knowledgeScore: z.number().min(0).max(100).nullable(),
    confidenceScore: z.number().min(0).max(100).nullable(),
    overallScore: z.number().min(0).max(100).nullable()
  }),
  claimVerification: z.array(claimVerificationFlagSchema).default([]),
  suggestedManagerQuestions: z.array(z.string()).min(4).max(8),
  aiHiringRecommendation: z.object({
    decision: recommendationSchema,
    rationale: z.string(),
    nextSteps: z.array(z.string()).default([])
  }),
  applicationHistorySummary: z.array(z.string()).default([])
});

export const managerQuestionSuggestionInputSchema = z.object({
  candidate: candidateProfileInputSchema,
  job: jobScreeningContextSchema,
  resumeScreening: resumeScreeningResultSchema,
  interviewEvaluation: interviewEvaluationResultSchema.optional(),
  requestedCount: z.number().int().min(4).max(8).default(6)
});

export const managerQuestionSuggestionSchema = z.object({
  suggestions: z.array(z.object({
    question: z.string(),
    targetSignal: z.string(),
    reason: z.string()
  })).min(4).max(8)
});

export type EmploymentType = z.infer<typeof employmentTypeSchema>;
export type WorkModel = z.infer<typeof workModelSchema>;
export type ExperienceLevel = z.infer<typeof experienceLevelSchema>;
export type Recommendation = z.infer<typeof recommendationSchema>;
export type SalaryRange = z.infer<typeof salaryRangeSchema>;
export type JobIntakeInput = z.infer<typeof jobIntakeInputSchema>;
export type JobIntakeConversationResult = z.infer<typeof jobIntakeConversationResultSchema>;
export type JobScreeningContext = z.infer<typeof jobScreeningContextSchema>;
export type GeneratedJobDescription = z.infer<typeof generatedJobDescriptionSchema>;
export type CandidateProfileInput = z.infer<typeof candidateProfileInputSchema>;
export type ResumeScreeningInput = z.infer<typeof resumeScreeningInputSchema>;
export type ResumeScreeningResult = z.infer<typeof resumeScreeningResultSchema>;
export type StructuredResumeAnalysis = z.infer<typeof structuredResumeAnalysisSchema>;
export type StructuredJobDescriptionAnalysis = z.infer<typeof structuredJobDescriptionAnalysisSchema>;
export type SemanticScreeningBreakdown = z.infer<typeof semanticScreeningBreakdownSchema>;
export type QualificationAnswers = z.infer<typeof qualificationAnswersSchema>;
export type QualificationEvaluationInput = z.infer<typeof qualificationEvaluationInputSchema>;
export type QualificationEvaluationResult = z.infer<typeof qualificationEvaluationResultSchema>;
export type InterviewQuestionGenerationInput = z.infer<typeof interviewQuestionGenerationInputSchema>;
export type InterviewQuestionSet = z.infer<typeof interviewQuestionSetSchema>;
export type InterviewEvaluationInput = z.infer<typeof interviewEvaluationInputSchema>;
export type InterviewEvaluationResult = z.infer<typeof interviewEvaluationResultSchema>;
export type ScoreEvidenceItem = z.infer<typeof scoreEvidenceItemSchema>;
export type CandidateScoreComponent = z.infer<typeof candidateScoreComponentSchema>;
export type CandidateScoringInput = z.infer<typeof candidateScoringInputSchema>;
export type CandidateScoringResult = z.infer<typeof candidateScoringResultSchema>;
export type CandidateIntelligenceReportInput = z.infer<typeof candidateIntelligenceReportInputSchema>;
export type CandidateIntelligenceReport = z.infer<typeof candidateIntelligenceReportSchema>;
export type ManagerQuestionSuggestionInput = z.infer<typeof managerQuestionSuggestionInputSchema>;
export type ManagerQuestionSuggestionResult = z.infer<typeof managerQuestionSuggestionSchema>;
