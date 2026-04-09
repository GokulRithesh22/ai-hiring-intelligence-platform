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
  } | null;
  applications: Array<{
    applicationId: string;
    jobId: string;
    jobTitle: string;
    status: string;
    appliedAt: string;
    resumeScore: number | null;
    interviewScore: number | null;
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
};

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
  linkedInUrl: string;
  resumeFileName: string;
  joiningTimeline: string;
  salaryExpectation: string;
  relocation: string;
};

export type ScreeningResult = {
  resumeScore: number;
  resumeAssessment: string;
  qualificationResult: string;
  qualificationReason: string;
  nextStep: string;
  statusMessage: string;
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

export type VoiceInterviewEvaluation = {
  communicationScore: number;
  knowledgeScore: number;
  confidenceScore: number;
  overallScore: number;
  summary: string;
  claimVerificationFlags: Array<{ claim: string; status: string }>;
  suggestedManagerQuestions: string[];
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
