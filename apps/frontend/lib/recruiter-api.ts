import { requireRecruiterSession } from "@/lib/recruiter-auth";
import type {
  HrAnalyticsData,
  HrCandidateDetail,
  HrCandidateListItem,
  HrDashboardView,
  HrJobDetail,
  ManagerDashboardData,
  ManagerJobIntelligenceDetail,
  RecruiterJobFilter,
  RecruiterOverviewData
} from "@/lib/types";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

async function recruiterFetch<T>(path: string): Promise<T> {
  if (!apiBaseUrl) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
  }

  const session = await requireRecruiterSession();
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      Authorization: `Bearer ${session.accessToken}`
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Failed recruiter API request: ${response.status}`);
  }

  return (await response.json()) as T;
}

function mapRecruiterMetrics(
  jobs: ManagerDashboardData,
  hrDashboard: HrDashboardView
): RecruiterOverviewData["metrics"] {
  const summary = jobs.summary ?? {
    activeJobDescriptions: jobs.jobs.filter((job) => !["CLOSED", "PAUSED"].includes(job.status)).length,
    totalApplicants: jobs.jobs.reduce((sum, job) => sum + job.applicantsCount, 0),
    shortlistedCandidates: jobs.jobs.reduce((sum, job) => sum + job.shortlistedCount, 0)
  };

  return [
    {
      label: "Job management",
      value: String(summary.activeJobDescriptions),
      context: "Active jobs available in recruiter workspace"
    },
    {
      label: "Candidate pipeline",
      value: String(summary.totalApplicants),
      context: "Applicants across visible jobs"
    },
    {
      label: "Shortlisted",
      value: String(summary.shortlistedCandidates),
      context: "Candidates ready for recruiter review"
    },
    {
      label: "AI interviews completed",
      value: String(hrDashboard.metrics[2]?.value ?? "0"),
      context: "Completed interview sessions"
    }
  ];
}

export async function getRecruiterOverview(
  filter: RecruiterJobFilter = "all"
): Promise<RecruiterOverviewData> {
  const [jobs, hrDashboard, candidates, analytics] = await Promise.all([
    recruiterFetch<ManagerDashboardData>(`/jobs/dashboard?scope=${filter}`),
    recruiterFetch<{
      openPositions: number;
      applicationsReceived: number;
      aiInterviewsCompleted: number;
      candidatesShortlisted: number;
      funnel: Array<{ label: string; value: number }>;
    }>("/hr/dashboard"),
    recruiterFetch<{ items: HrCandidateListItem[] }>("/hr/candidates"),
    recruiterFetch<HrAnalyticsData>("/hr/analytics")
  ]);

  const hrDashboardView: HrDashboardView = {
    metrics: [
      { label: "Open Positions", value: String(hrDashboard.openPositions) },
      { label: "Applications Received", value: String(hrDashboard.applicationsReceived) },
      { label: "AI Interviews Completed", value: String(hrDashboard.aiInterviewsCompleted) },
      { label: "Candidates Shortlisted", value: String(hrDashboard.candidatesShortlisted) }
    ],
    funnel: hrDashboard.funnel
  };

  return {
    metrics: mapRecruiterMetrics(jobs, hrDashboardView),
    jobs: jobs.jobs,
    candidates: candidates.items,
    analytics,
    funnel: hrDashboard.funnel,
    activeFilter: filter
  };
}

export async function getRecruiterJobBoard(filter: RecruiterJobFilter = "all") {
  return recruiterFetch<ManagerDashboardData>(`/jobs/dashboard?scope=${filter}`);
}

export async function getRecruiterJobIntelligence(jobId: string): Promise<ManagerJobIntelligenceDetail> {
  return recruiterFetch<ManagerJobIntelligenceDetail>(`/jobs/${jobId}/intelligence`);
}

export async function getRecruiterCandidates() {
  const payload = await recruiterFetch<{ items: HrCandidateListItem[] }>("/hr/candidates");
  return payload.items;
}

export async function getRecruiterCandidate(candidateId: string) {
  return recruiterFetch<HrCandidateDetail>(`/hr/candidates/${candidateId}`);
}

export async function getRecruiterJob(jobId: string) {
  return recruiterFetch<HrJobDetail>(`/hr/jobs/${jobId}`);
}

export async function getRecruiterAnalytics() {
  return recruiterFetch<HrAnalyticsData>("/hr/analytics");
}
