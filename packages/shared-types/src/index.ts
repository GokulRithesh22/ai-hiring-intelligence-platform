export type UUID = string;

export type UserRole = "MANAGER" | "HR" | "RECRUITER" | "ADMIN";
export type JobStatus =
  | "DRAFT"
  | "PENDING_HR_APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "PUBLISHED"
  | "CLOSED";
export type ApplicationStatus =
  | "APPLIED"
  | "SCREENING_FAILED"
  | "QUALIFICATION_FAILED"
  | "INTERVIEW_PENDING"
  | "INTERVIEW_COMPLETED"
  | "SHORTLISTED"
  | "REJECTED"
  | "HIRED";
export type InterviewStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
export type EmailEventType =
  | "APPLICATION_RECEIVED"
  | "INTERVIEW_INVITE"
  | "INTERVIEW_COMPLETED"
  | "CANDIDATE_SHORTLISTED"
  | "CANDIDATE_REJECTED";
export type CandidateSource = "CAREERS_PAGE" | "LINKEDIN" | "REFERRAL" | "DIRECT";
export type EmploymentType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERN";

export interface User {
  id: UUID;
  email: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface JobIntakeAnswer {
  prompt: string;
  answer: string;
}

export interface Job {
  id: UUID;
  title: string;
  department: string | null;
  location: string | null;
  employmentType: EmploymentType;
  status: JobStatus;
  minExperienceYears: number | null;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string | null;
  joiningTimeline: string | null;
  relocationRequired: boolean;
  intakeAnswers: JobIntakeAnswer[];
  generatedDescription: string;
  approvedDescription: string | null;
  approvalNotes: string | null;
  createdBy: UUID;
  approvedBy: UUID | null;
  approvedAt: string | null;
  publishedAt: string | null;
  structuredAnalysis: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface Candidate {
  id: UUID;
  fullName: string;
  email: string;
  phone: string | null;
  linkedinUrl: string | null;
  resumeFileUrl: string | null;
  resumeText: string | null;
  currentLocation: string | null;
  totalExperienceYears: number | null;
  currentCompany: string | null;
  source: CandidateSource;
  permanentProfile: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface QualificationAnswers {
  joiningTimeline: string;
  expectedSalary: number;
  currency: string;
  relocationWillingness: boolean;
}

export interface Application {
  id: UUID;
  jobId: UUID;
  candidateId: UUID;
  resumeUrl: string | null;
  expectedCtc: number | null;
  joiningDate: string | null;
  status: ApplicationStatus;
  resumeMatchScore: number | null;
  qualificationPassed: boolean | null;
  qualificationAnswers: QualificationAnswers | null;
  interviewScore: number | null;
  screeningDecisionReason: string | null;
  appliedAt: string;
  updatedAt: string;
}

export interface InterviewQuestionAnswer {
  id: UUID;
  sessionId: UUID;
  question: string;
  answer: string;
  evaluationScore: number;
  category?: VoiceInterviewCategory | null;
  askedAsFollowUp?: boolean;
  rationale?: string | null;
  scoreBreakdown?: VoiceResponseScoreBreakdown | null;
  createdAt: string;
}

export type ScoreEvidenceSource = "RESUME" | "INTERVIEW" | "SCREENING" | "SYSTEM";

export interface ScoreEvidenceItem {
  source: ScoreEvidenceSource;
  signal: string;
  excerpt: string;
}

export interface CandidateScoreComponentDetail {
  score: number;
  rationale: string;
  evidence: ScoreEvidenceItem[];
}

export interface CandidateScore {
  id: UUID;
  applicationId: UUID;
  candidateId: UUID;
  jobId: UUID;
  roleCapability: number;
  thinkingBehavior: number;
  impact: number;
  transferability: number;
  potential: number;
  finalScore: number;
  confidenceScore: number;
  confidenceLabel: string;
  summary: string | null;
  recommendation: string | null;
  componentBreakdown: {
    roleCapability: CandidateScoreComponentDetail;
    thinkingBehavior: CandidateScoreComponentDetail;
    impact: CandidateScoreComponentDetail;
    transferability: CandidateScoreComponentDetail;
    potential: CandidateScoreComponentDetail;
  };
  evidenceSummary: string[];
  createdAt: string;
  updatedAt: string;
}

export interface InterviewEvaluationDetail {
  id: UUID;
  sessionId: UUID;
  interviewItemId: UUID | null;
  question: string;
  answer: string;
  score: number;
  rationale: string;
  evidence: string[];
  createdAt: string;
  updatedAt: string;
}

export type VoiceInterviewCategory =
  | "experience_validation"
  | "skill_depth_validation"
  | "problem_solving_scenario"
  | "role_simulation"
  | "behavioral_question";

export interface VoiceResponseScoreBreakdown {
  communicationClarity: number;
  technicalDepth: number;
  problemSolvingStructure: number;
  businessUnderstanding: number;
}

export interface VoiceTranscriptTurn {
  id: UUID;
  role: "assistant" | "candidate";
  kind: "greeting" | "question" | "follow_up" | "response" | "closing";
  text: string;
  category?: VoiceInterviewCategory | null;
  linkedQuestionId?: UUID | null;
  scores?: VoiceResponseScoreBreakdown | null;
  createdAt: string;
}

export interface VoiceInterviewTranscriptDocument {
  format: "voice_interview_v1";
  transcriptText: string;
  turns: VoiceTranscriptTurn[];
  items: Array<{
    question: string;
    answer: string;
    evaluationScore: number;
    category?: VoiceInterviewCategory | null;
    askedAsFollowUp?: boolean;
    rationale?: string | null;
    scoreBreakdown?: VoiceResponseScoreBreakdown | null;
  }>;
}

export interface InterviewSession {
  id: UUID;
  applicationId: UUID;
  status: InterviewStatus;
  startedAt: string | null;
  completedAt: string | null;
  communicationScore: number | null;
  knowledgeScore: number | null;
  confidenceScore: number | null;
  overallScore: number | null;
  summary: string | null;
  transcript: string | null;
  structuredTranscript?: VoiceInterviewTranscriptDocument | null;
  createdAt: string;
  updatedAt: string;
  items?: InterviewQuestionAnswer[];
}

export interface CandidateInsight {
  id: UUID;
  candidateId: UUID;
  latestApplicationId: UUID | null;
  resumeAnalysis: Record<string, unknown>;
  linkedinInsights: Record<string, unknown>;
  interviewTranscript: string | null;
  evaluationScores: Record<string, unknown>;
  claimVerificationFlags: Array<Record<string, unknown>>;
  suggestedManagerQuestions: string[];
  hiringRecommendation: string | null;
  candidateScore?: CandidateScore | null;
  applicationHistory: Array<{
    jobTitle: string;
    status: string;
    appliedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface ScreeningResultDetail {
  id: UUID;
  applicationId: UUID;
  candidateId: UUID;
  jobId: UUID;
  semanticSimilarity: number;
  experienceMatch: number;
  skillsMatch: number;
  domainMatch: number;
  achievementsMatch: number;
  finalScore: number;
  resumeAnalysis: Record<string, unknown>;
  jobAnalysis: Record<string, unknown>;
  reasoningSummary: string | null;
  strengths: string[];
  weaknesses: string[];
  createdAt: string;
  updatedAt: string;
}

export interface EmailEvent {
  id: UUID;
  applicationId: UUID | null;
  candidateId: UUID | null;
  eventType: EmailEventType;
  recipientEmail: string;
  providerMessageId: string | null;
  status: "PENDING" | "SENT" | "FAILED";
  metadata: Record<string, unknown>;
  sentAt: string | null;
  createdAt: string;
}

export interface DashboardStats {
  totalApplicants: number;
  aiInterviewsCompleted: number;
  candidatesShortlisted: number;
  activeJobRoles: number;
}

export interface HrFunnelStage {
  label: string;
  value: number;
}

export interface HrDashboardData {
  openPositions: number;
  applicationsReceived: number;
  aiInterviewsCompleted: number;
  candidatesShortlisted: number;
  funnel: HrFunnelStage[];
}

export interface HrJobListItem {
  id: UUID;
  title: string;
  postedBy: string;
  location: string | null;
  applicationsCount: number;
  status: JobStatus;
  createdAt: string;
}

export interface HrJobApplicationItem {
  applicationId: UUID;
  candidateId: UUID;
  candidateName: string;
  candidateEmail: string;
  resumeScore: number | null;
  interviewScore: number | null;
  candidateScore: number | null;
  candidateScoreConfidenceLabel: string | null;
  joiningTimeline: string | null;
  salaryExpectation: number | null;
  relocation: boolean | null;
  status: ApplicationStatus;
  appliedAt: string;
}

export interface HrJobDetail {
  id: UUID;
  title: string;
  location: string | null;
  status: JobStatus;
  createdAt: string;
  hiringManager: {
    id: UUID;
    fullName: string;
    email: string;
  } | null;
  description: string;
  candidatePipeline: HrFunnelStage[];
  candidates: HrJobApplicationItem[];
}

export interface HrCandidateListItem {
  id: UUID;
  name: string;
  email: string;
  currentCompany: string | null;
  latestJobTitle: string | null;
  latestApplicationStatus: ApplicationStatus | null;
  resumeScore: number | null;
  interviewScore: number | null;
  candidateScore: number | null;
  candidateScoreConfidenceLabel: string | null;
  appliedAt: string | null;
}

export interface HrCandidateApplicationHistoryItem {
  applicationId: UUID;
  jobId: UUID;
  jobTitle: string;
  status: ApplicationStatus;
  appliedAt: string;
  resumeScore: number | null;
  interviewScore: number | null;
  candidateScore: number | null;
  candidateScoreConfidenceLabel: string | null;
}

export interface HrCandidateDetail {
  candidate: Candidate;
  insight: CandidateInsight | null;
  applications: HrCandidateApplicationHistoryItem[];
  interviews: InterviewSession[];
  screeningResults: ScreeningResultDetail[];
}

export interface HrAnalyticsData {
  applicationsPerJob: Array<{
    jobId: UUID;
    jobTitle: string;
    applicationsCount: number;
  }>;
  interviewCompletionRate: number;
  averageResumeScore: number | null;
  averageInterviewScore: number | null;
}

export interface CandidateTableRow {
  applicationId: UUID;
  candidateId: UUID;
  jobId: UUID;
  name: string;
  resumeScore: number | null;
  interviewScore: number | null;
  joiningTimeline: string | null;
  salaryExpectation: number | null;
  relocation: boolean | null;
  status: ApplicationStatus;
}

export interface PaginationQuery {
  limit?: number;
  offset?: number;
}

export interface AuthenticatedRequestContext {
  user: User | null;
}

export interface CreateDemoSessionInput {
  email: string;
  fullName: string;
  role: UserRole;
}

export interface CreateJobInput {
  title: string;
  department?: string | null;
  location?: string | null;
  employmentType?: EmploymentType;
  minExperienceYears?: number | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency?: string | null;
  joiningTimeline?: string | null;
  relocationRequired?: boolean;
  intakeAnswers?: JobIntakeAnswer[];
  generatedDescription: string;
}

export interface JobIntakeRequest {
  answers: JobIntakeAnswer[];
}

export interface GenerateDescriptionRequest {
  title: string;
  intakeAnswers: JobIntakeAnswer[];
}

export interface UpdateJobApprovalInput {
  status: Extract<JobStatus, "APPROVED" | "REJECTED" | "PUBLISHED">;
  approvedDescription?: string | null;
  approvalNotes?: string | null;
}

export interface CreateCandidateInput {
  fullName: string;
  email: string;
  phone?: string | null;
  linkedinUrl?: string | null;
  resumeFileUrl?: string | null;
  resumeText?: string | null;
  currentLocation?: string | null;
  totalExperienceYears?: number | null;
  currentCompany?: string | null;
  source?: CandidateSource;
  permanentProfile?: Record<string, unknown>;
}

export interface CreateApplicationInput {
  candidateId: UUID;
  jobId: UUID;
  resumeUrl?: string | null;
  expectedCtc?: number | null;
  joiningDate?: string | null;
  resumeMatchScore?: number | null;
  qualificationPassed?: boolean | null;
  qualificationAnswers?: QualificationAnswers | null;
  screeningDecisionReason?: string | null;
}

export interface PublicJobSummary {
  id: UUID;
  title: string;
  location: string | null;
  employmentType: EmploymentType;
  description: string;
  status: JobStatus;
}

export interface CreateInterviewSessionInput {
  applicationId: UUID;
  summary?: string | null;
  transcript?: string | null;
}

export interface CompleteInterviewSessionInput {
  communicationScore: number;
  knowledgeScore: number;
  confidenceScore: number;
  summary: string;
  transcript: string;
  voiceTranscript?: VoiceTranscriptTurn[];
  items: Array<{
    question: string;
    answer: string;
    evaluationScore: number;
    category?: VoiceInterviewCategory | null;
    askedAsFollowUp?: boolean;
    rationale?: string | null;
    scoreBreakdown?: VoiceResponseScoreBreakdown | null;
  }>;
}

export interface UpsertCandidateInsightInput {
  candidateId: UUID;
  latestApplicationId?: UUID | null;
  resumeAnalysis?: Record<string, unknown>;
  linkedinInsights?: Record<string, unknown>;
  interviewTranscript?: string | null;
  evaluationScores?: Record<string, unknown>;
  claimVerificationFlags?: Array<Record<string, unknown>>;
  suggestedManagerQuestions?: string[];
  hiringRecommendation?: string | null;
}

export interface UpsertCandidateScoreInput {
  applicationId: UUID;
  candidateId: UUID;
  jobId: UUID;
  roleCapability: number;
  thinkingBehavior: number;
  impact: number;
  transferability: number;
  potential: number;
  finalScore: number;
  confidenceScore: number;
  confidenceLabel: string;
  summary?: string | null;
  recommendation?: string | null;
  componentBreakdown: CandidateScore["componentBreakdown"];
  evidenceSummary?: string[];
}

export interface ReplaceInterviewEvaluationsInput {
  sessionId: UUID;
  items: Array<{
    interviewItemId?: UUID | null;
    question: string;
    answer: string;
    score: number;
    rationale: string;
    evidence?: string[];
  }>;
}

export interface UpsertScreeningResultInput {
  applicationId: UUID;
  candidateId: UUID;
  jobId: UUID;
  semanticSimilarity: number;
  experienceMatch: number;
  skillsMatch: number;
  domainMatch: number;
  achievementsMatch: number;
  finalScore: number;
  resumeAnalysis?: Record<string, unknown>;
  jobAnalysis?: Record<string, unknown>;
  reasoningSummary?: string | null;
  strengths?: string[];
  weaknesses?: string[];
}

export interface CreateEmailEventInput {
  applicationId?: UUID | null;
  candidateId?: UUID | null;
  eventType: EmailEventType;
  recipientEmail: string;
  providerMessageId?: string | null;
  status?: "PENDING" | "SENT" | "FAILED";
  metadata?: Record<string, unknown>;
  sentAt?: string | null;
}

export type ManagerJobCreationMode = "CONVERSATIONAL_AI" | "STRUCTURED_INPUT";

export type ManagerJobFeedbackAction =
  | "TOO_GENERIC"
  | "TOO_COMPLEX"
  | "IMPROVE_RESPONSIBILITIES"
  | "MAKE_MORE_OUTCOME_FOCUSED";

export interface ManagerPipelineDistributionItem {
  status: string;
  label: string;
  count: number;
}

export interface ManagerJobDashboardItem {
  id: UUID;
  title: string;
  status: JobStatus;
  location: string | null;
  createdAt: string;
  updatedAt: string;
  applicantsCount: number;
  shortlistedCount: number;
  descriptionPreview: string;
  pipelineDistribution: ManagerPipelineDistributionItem[];
}

export interface ManagerDashboardData {
  summary: {
    activeJobDescriptions: number;
    totalApplicants: number;
    shortlistedCandidates: number;
    pendingApproval: number;
  };
  jobs: ManagerJobDashboardItem[];
}

export interface ManagerJobCandidateEntry {
  applicationId: UUID;
  candidateId: UUID;
  candidateName: string;
  currentCompany: string | null;
  currentTitle: string | null;
  status: ApplicationStatus;
  resumeScore: number | null;
  interviewScore: number | null;
  candidateScore: number | null;
  candidateScoreConfidenceLabel: string | null;
  insightSummary: string;
}

export interface ManagerJobIntelligenceDetail {
  job: ManagerJobDashboardItem;
  candidates: ManagerJobCandidateEntry[];
}

export interface ManagerJobDescriptionVariant {
  id: string;
  label: string;
  tone: string;
  summary: string;
  description: string;
  responsibilities: string[];
  focusAreas: string[];
  feedbackApplied: ManagerJobFeedbackAction[];
}

export interface ManagerJobDraftRequest {
  mode: ManagerJobCreationMode;
  title: string;
  department?: string | null;
  location?: string | null;
  employmentType?: EmploymentType;
  minExperienceYears?: number | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency?: string | null;
  joiningTimeline?: string | null;
  relocationRequired?: boolean;
  intakeAnswers: JobIntakeAnswer[];
}

export interface ManagerJobDraftResponse {
  job: Job;
  variants: ManagerJobDescriptionVariant[];
  selectedVariantId: string;
}

export interface RefineManagerJobDescriptionRequest {
  selectedVariantId: string;
  feedback: ManagerJobFeedbackAction;
}
