import { requireHrSession } from "@/lib/hr-auth";
import type {
  HrAnalyticsData,
  HrCandidateDetail,
  HrCandidateListItem,
  HrDashboardView,
  HrJobApplicationItem,
  HrJobDetail,
  HrJobListItem
} from "@/lib/types";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

async function hrFetch<T>(path: string): Promise<T> {
  if (!apiBaseUrl) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
  }

  const session = await requireHrSession();
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      Authorization: `Bearer ${session.accessToken}`
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Failed HR API request: ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function getProtectedHrDashboard(): Promise<HrDashboardView> {
  const data = await hrFetch<{
    openPositions: number;
    applicationsReceived: number;
    aiInterviewsCompleted: number;
    candidatesShortlisted: number;
    funnel: Array<{ label: string; value: number }>;
  }>("/hr/dashboard");

  return {
    metrics: [
      { label: "Open Positions", value: String(data.openPositions) },
      { label: "Applications Received", value: String(data.applicationsReceived) },
      { label: "AI Interviews Completed", value: String(data.aiInterviewsCompleted) },
      { label: "Candidates Shortlisted", value: String(data.candidatesShortlisted) }
    ],
    funnel: data.funnel
  };
}

export async function getProtectedHrJobs() {
  const payload = await hrFetch<{ items: HrJobListItem[] }>("/hr/jobs");
  return payload.items;
}

export async function getProtectedHrJob(jobId: string): Promise<HrJobDetail> {
  return hrFetch<HrJobDetail>(`/hr/jobs/${jobId}`);
}

export async function getProtectedHrJobApplications(jobId: string) {
  const payload = await hrFetch<{ items: HrJobApplicationItem[] }>(`/hr/jobs/${jobId}/applications`);
  return payload.items;
}

export async function getProtectedHrCandidates() {
  const payload = await hrFetch<{ items: HrCandidateListItem[] }>("/hr/candidates");
  return payload.items;
}

export async function getProtectedHrCandidate(candidateId: string) {
  return hrFetch<HrCandidateDetail>(`/hr/candidates/${candidateId}`);
}

export async function getProtectedHrAnalytics() {
  return hrFetch<HrAnalyticsData>("/hr/analytics");
}
