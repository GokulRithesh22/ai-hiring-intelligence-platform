import { requireManagerSession } from "@/lib/manager-auth";
import type {
  ManagerDashboardData,
  ManagerJobCardData,
  ManagerJobIntelligenceDetail
} from "@/lib/types";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

function mapManagerDashboardResponse(payload: {
  summary: {
    activeJobDescriptions: number;
    totalApplicants: number;
    shortlistedCandidates: number;
    pendingApproval: number;
  };
  jobs: ManagerJobCardData[];
}): ManagerDashboardData {
  return {
    metrics: [
      {
        label: "Active job descriptions",
        value: String(payload.summary.activeJobDescriptions),
        context: "Multiple pipelines managed from one dashboard"
      },
      {
        label: "Applicants in manager view",
        value: String(payload.summary.totalApplicants),
        context: "Current candidate volume across all owned roles"
      },
      {
        label: "Shortlisted candidates",
        value: String(payload.summary.shortlistedCandidates),
        context: "Candidates ready for manager-level review"
      },
      {
        label: "Pending HR approval",
        value: String(payload.summary.pendingApproval),
        context: "Drafts still waiting on HR action"
      }
    ],
    jobs: payload.jobs.map((job) => ({
      ...job,
      location: job.location ?? "Flexible / remote"
    }))
  };
}

async function managerFetch<T>(path: string): Promise<T> {
  if (!apiBaseUrl) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
  }

  const session = await requireManagerSession();
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      Authorization: `Bearer ${session.accessToken}`
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Failed manager API request: ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function getProtectedManagerDashboard(): Promise<ManagerDashboardData> {
  const payload = await managerFetch<{
    summary: {
      activeJobDescriptions: number;
      totalApplicants: number;
      shortlistedCandidates: number;
      pendingApproval: number;
    };
    jobs: ManagerJobCardData[];
  }>("/jobs/manager/dashboard");

  return mapManagerDashboardResponse(payload);
}

export async function getProtectedManagerJobIntelligence(
  jobId: string
): Promise<ManagerJobIntelligenceDetail> {
  return managerFetch<ManagerJobIntelligenceDetail>(`/jobs/${jobId}/manager-intelligence`);
}
