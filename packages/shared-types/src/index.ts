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
  createdAt: string;
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
  applicationHistory: Array<{
    jobTitle: string;
    status: string;
    appliedAt: string;
  }>;
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
  items: Array<{
    question: string;
    answer: string;
    evaluationScore: number;
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
