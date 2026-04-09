export type LandingMetric = {
  label: string;
  value: string;
};

export type LandingShowcaseItem = {
  title: string;
  subtitle: string;
  body: string;
  status: string;
  statusClass: string;
};

export type LandingFeature = {
  eyebrow: string;
  title: string;
  description: string;
};

export type LandingWorkflowStep = {
  title: string;
  description: string;
};

export type LandingView = {
  eyebrow: string;
  title: string;
  description: string;
};

export type LandingContent = {
  metrics: LandingMetric[];
  showcase: LandingShowcaseItem[];
  features: LandingFeature[];
  workflow: LandingWorkflowStep[];
  productViews: LandingView[];
};

export type PublicJobCard = {
  id: string;
  slug: string;
  title: string;
  location: string;
  experienceLevel: string;
  summary: string;
};

export type JobIntakeQuestion = {
  id: string;
  label: string;
  prompt: string;
  placeholder: string;
};

export type JobIntakePayload = {
  jobTitle: string;
  answers: Record<string, string>;
};

export type GeneratedJobDescription = {
  title: string;
  team: string;
  mission: string;
  responsibilities: string[];
  mustHaveSkills: string[];
  experienceLevel: string;
  salaryRange: string;
  joiningTimeline: string;
  relocation: string;
  locationMode: string;
  hiringPriority: string;
  managerInterviewPrompts: string[];
  hrSummary: string;
};

export type ManagerCreationMode = "conversational" | "structured";

export type ManagerJdFeedbackAction =
  | "TOO_GENERIC"
  | "TOO_COMPLEX"
  | "IMPROVE_RESPONSIBILITIES"
  | "MAKE_MORE_OUTCOME_FOCUSED";

export type ManagerDashboardMetric = {
  label: string;
  value: string;
  context: string;
};

export type ManagerPipelineDistribution = {
  label: string;
  count: number;
  status: string;
};

export type ManagerJobCardData = {
  id: string;
  title: string;
  status: string;
  location: string;
  createdAt: string;
  updatedAt: string;
  descriptionPreview: string;
  applicantsCount: number;
  shortlistedCount: number;
  pipelineDistribution: ManagerPipelineDistribution[];
};

export type ManagerDashboardData = {
  metrics: ManagerDashboardMetric[];
  jobs: ManagerJobCardData[];
};

export type RecruiterJobFilter = "all" | "mine";

export type RecruiterOverviewData = {
  metrics: ManagerDashboardMetric[];
  jobs: ManagerJobCardData[];
  candidates: HrCandidateListItem[];
  analytics: HrAnalyticsData;
  funnel: HrFunnelStage[];
  activeFilter: RecruiterJobFilter;
};

export type ManagerJobDescriptionVariant = {
  id: string;
  label: string;
  tone: string;
  summary: string;
  description: string;
  responsibilities: string[];
  focusAreas: string[];
  feedbackApplied: ManagerJdFeedbackAction[];
};

export type ManagerJobDraftPayload = {
  mode: ManagerCreationMode;
  jobTitle: string;
  department?: string;
  location?: string;
  experienceLevel?: string;
  salaryRange?: string;
  joiningTimeline?: string;
  relocation?: string;
  answers: Record<string, string>;
};

export type ManagerJobDraftResult = {
  jobId: string | null;
  jobTitle: string;
  selectedVariantId: string;
  variants: ManagerJobDescriptionVariant[];
};

export type ManagerCandidateIntelligenceEntry = {
  applicationId: string;
  candidateId: string;
  candidateName: string;
  currentCompany: string | null;
  currentTitle: string | null;
  status: string;
  resumeScore: number | null;
  interviewScore: number | null;
  insightSummary: string;
};

export type ManagerJobIntelligenceDetail = {
  job: ManagerJobCardData;
  candidates: ManagerCandidateIntelligenceEntry[];
};

export type DashboardStat = {
  label: string;
  value: string;
  change: string;
};

export type DashboardCandidate = {
  id: string;
  name: string;
  resumeScore: number;
  interviewScore: number;
  joiningTimeline: string;
  salaryExpectation: string;
  relocation: string;
  status: "Shortlisted" | "Interviewing" | "Screened out" | "Pending HR review";
};

export type DashboardFilters = {
  resumeScoreMin?: string;
  interviewScoreMin?: string;
  joiningTimeline?: string;
  salaryMax?: string;
  relocation?: string;
  status?: string;
};

export type HrDashboardData = {
  stats: DashboardStat[];
  candidates: DashboardCandidate[];
};

export type HrDashboardMetric = {
  label: string;
  value: string;
};

export type HrFunnelStage = {
  label: string;
  value: number;
};

export type HrDashboardView = {
  metrics: HrDashboardMetric[];
  funnel: HrFunnelStage[];
};

export type HrJobListItem = {
  id: string;
  title: string;
  postedBy: string;
  location: string | null;
  applicationsCount: number;
  status: string;
  createdAt: string;
};

export type HrJobApplicationItem = {
  applicationId: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  resumeScore: number | null;
  interviewScore: number | null;
  candidateScore: number | null;
  candidateScoreConfidenceLabel: string | null;
  joiningTimeline: string | null;
  salaryExpectation: number | null;
  relocation: boolean | null;
  status: string;
  appliedAt: string;
};

export type HrJobDetail = {
  id: string;
  title: string;
  location: string | null;
  status: string;
  createdAt: string;
  hiringManager: {
    id: string;
    fullName: string;
    email: string;
  } | null;
  description: string;
  candidatePipeline: HrFunnelStage[];
  candidates: HrJobApplicationItem[];
};

export type HrCandidateListItem = {
  id: string;
  name: string;
  email: string;
  currentCompany: string | null;
  latestJobTitle: string | null;
  latestApplicationStatus: string | null;
  resumeScore: number | null;
  interviewScore: number | null;
  candidateScore: number | null;
  candidateScoreConfidenceLabel: string | null;
  appliedAt: string | null;
};

export type HrCandidateDetail = {
  candidate: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    linkedinUrl: string | null;
    currentLocation: string | null;
    currentCompany: string | null;
    totalExperienceYears: number | null;
    source: string;
  };
  insight: {
    resumeAnalysis: Record<string, unknown>;
    linkedinInsights: Record<string, unknown>;
    interviewTranscript: string | null;
    evaluationScores: Record<string, unknown>;
    claimVerificationFlags: Array<Record<string, unknown>>;
    suggestedManagerQuestions: string[];
    hiringRecommendation: string | null;
    candidateScore?: {
      finalScore: number;
      confidenceScore: number;
      confidenceLabel: string;
      summary: string | null;
      recommendation: string | null;
      roleCapability: number;
      thinkingBehavior: number;
      impact: number;
      transferability: number;
      potential: number;
      evidenceSummary: string[];
    } | null;
  } | null;
  applications: Array<{
    applicationId: string;
    jobId: string;
    jobTitle: string;
    status: string;
    appliedAt: string;
    resumeScore: number | null;
    interviewScore: number | null;
    candidateScore?: number | null;
    candidateScoreConfidenceLabel?: string | null;
  }>;
  interviews: Array<{
    id: string;
    status: string;
    communicationScore: number | null;
    knowledgeScore: number | null;
    confidenceScore: number | null;
    overallScore: number | null;
    summary: string | null;
    transcript: string | null;
    items?: Array<{
      id: string;
      question: string;
      answer: string;
      evaluationScore: number;
    }>;
  }>;
  screeningResults: Array<{
    id: string;
    applicationId: string;
    candidateId: string;
    jobId: string;
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
  }>;
};

export type ScreeningResult = HrCandidateDetail["screeningResults"][number];

export type HrAnalyticsData = {
  applicationsPerJob: Array<{
    jobId: string;
    jobTitle: string;
    applicationsCount: number;
  }>;
  interviewCompletionRate: number;
  averageResumeScore: number | null;
  averageInterviewScore: number | null;
};

export type ApplicationPipelineStep = {
  title: string;
  description: string;
  status: string;
  statusClass: string;
};

export type ApplicationPortalData = {
  job: {
    id: string;
    title: string;
    summary: string;
    experienceLevel: string;
    salaryRange: string;
    joiningTimeline: string;
    relocation: string;
    location: string;
  };
  pipeline: ApplicationPipelineStep[];
};

export type CandidateApplicationPayload = {
  jobId: string;
  fullName: string;
  email: string;
  phone?: string;
  linkedInUrl?: string;
  resumeFile: File | null;
  earliestJoiningDate: string;
  expectedCtc: string;
  relocation: string;
};

export type ApplicationSubmissionResult = {
  applicationId: string;
  candidateId: string;
  status: "qualified" | "rejected";
  statusMessage: string;
  interviewInvitation: string | null;
  interviewSessionId?: string | null;
  interviewQuestions: string[];
};

export type VoiceInterviewConfig = {
  enabled: boolean;
  voiceId: string | null;
  ttsModelId: string;
  sttModelId: string;
};

export type VoiceTranscriptionResult = {
  text: string;
  languageCode: string | null;
};

export type VoiceInterviewCategory =
  | "experience_validation"
  | "skill_depth_validation"
  | "problem_solving_scenario"
  | "role_simulation"
  | "behavioral_question";

export type VoiceResponseScoreBreakdown = {
  communicationClarity: number;
  technicalDepth: number;
  problemSolvingStructure: number;
  businessUnderstanding: number;
};

export type VoiceInterviewTurn = {
  id: string;
  role: "assistant" | "candidate";
  kind: "greeting" | "question" | "follow_up" | "response" | "closing";
  text: string;
  category?: VoiceInterviewCategory | null;
  linkedQuestionId?: string | null;
  scores?: VoiceResponseScoreBreakdown | null;
  createdAt: string;
};

export type VoiceInterviewEvaluation = {
  communicationClarity: number;
  technicalDepth: number;
  problemSolvingStructure: number;
  businessUnderstanding: number;
  responseEvaluations: Array<{
    questionId: string;
    question: string;
    answer: string;
    category: VoiceInterviewCategory;
    askedAsFollowUp: boolean;
    evaluationScore: number;
    rationale: string;
    scoreBreakdown: VoiceResponseScoreBreakdown;
  }>;
  communicationScore: number;
  knowledgeScore: number;
  confidenceScore: number;
  overallScore: number;
  summary: string;
  claimVerificationFlags: Array<{ claim: string; status: string }>;
  suggestedManagerQuestions: string[];
};

export type StartVoiceInterviewConversationInput = {
  questions?: string[];
  interviewSessionId?: string | null;
  applicationId?: string | null;
};

export type SubmitVoiceInterviewTurnInput = {
  conversationId: string;
  transcript?: string;
  audioBase64?: string;
  mimeType?: string;
  fileName?: string;
};

export type VoiceInterviewConversationState = {
  conversationId: string;
  interviewSessionId: string | null;
  completed: boolean;
  status: string;
  currentPrompt: string | null;
  turns: VoiceInterviewTurn[];
  latestTranscript: string | null;
  evaluation: VoiceInterviewEvaluation | null;
};

export type CandidateProfileApplication = {
  jobTitle: string;
  date: string;
  status: string;
  statusClass: string;
  notes: string;
};

export type CandidateTranscriptItem = {
  question: string;
  answer: string;
  score: string;
};

export type CandidateProfileData = {
  id: string;
  name: string;
  currentRole: string;
  location: string;
  overview: string;
  resumeScore: string;
  resumeSynopsis: string;
  interviewScore: string;
  interviewSummary: string;
  applicationHistory: CandidateProfileApplication[];
  resumeInsights: string;
  linkedInInsights: string;
  interviewTranscript: CandidateTranscriptItem[];
  claimVerification: string;
  suggestedQuestions: string[];
  scoreEngine: {
    finalScore: string;
    confidence: string;
    roleCapability: string;
    thinkingBehavior: string;
    impact: string;
    transferability: string;
    potential: string;
    evidence: string[];
  };
  scoreBreakdown: {
    communication: string;
    knowledge: string;
    confidence: string;
    overall: string;
  };
  recommendation: {
    label: string;
    title: string;
    summary: string;
    statusClass: string;
    highlights: string[];
  };
};
