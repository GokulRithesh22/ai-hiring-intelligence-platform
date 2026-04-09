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
