import {
  applicationPortalData,
  candidateProfile,
  dashboardCandidates,
  defaultGeneratedJobDescription,
  hrDashboardData,
  jobIntakeQuestions,
  landingContent,
  screeningResult
} from "@/lib/mock-data";
import type {
  ApplicationPortalData,
  CandidateApplicationPayload,
  CandidateProfileData,
  DashboardCandidate,
  DashboardFilters,
  GeneratedJobDescription,
  HrDashboardData,
  JobIntakePayload,
  JobIntakeQuestion,
  LandingContent,
  ScreeningResult
} from "@/lib/types";

const apiMode = process.env.NEXT_PUBLIC_API_MODE ?? "mock";
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function requestOrFallback<T>(
  path: string,
  options: RequestInit | undefined,
  fallback: () => Promise<T>
) {
  if (apiMode !== "live" || !apiBaseUrl) {
    return fallback();
  }

  try {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers ?? {})
      },
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    return (await response.json()) as T;
  } catch {
    return fallback();
  }
}

export async function getLandingContent(): Promise<LandingContent> {
  return requestOrFallback("/landing", undefined, async () => {
    await sleep(120);
    return landingContent;
  });
}

export async function getJobIntakeQuestions(): Promise<JobIntakeQuestion[]> {
  return requestOrFallback("/jobs/intake/questions", undefined, async () => {
    await sleep(120);
    return jobIntakeQuestions;
  });
}

export async function generateJobDescription(
  payload: JobIntakePayload
): Promise<GeneratedJobDescription> {
  return requestOrFallback(
    "/jobs/generate",
    {
      method: "POST",
      body: JSON.stringify(payload)
    },
    async () => {
      await sleep(320);
      return {
        ...defaultGeneratedJobDescription,
        title: payload.jobTitle,
        mission: payload.answers.problem ?? defaultGeneratedJobDescription.mission,
        mustHaveSkills: (payload.answers.skills ?? "")
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean)
          .slice(0, 6),
        experienceLevel:
          payload.answers.experience ?? defaultGeneratedJobDescription.experienceLevel,
        salaryRange: payload.answers.salary ?? defaultGeneratedJobDescription.salaryRange,
        joiningTimeline:
          payload.answers.joining ?? defaultGeneratedJobDescription.joiningTimeline,
        relocation: payload.answers.relocation ?? defaultGeneratedJobDescription.relocation,
        hrSummary: `Role approved for ${payload.jobTitle}. ${payload.answers.problem ?? ""}`
      };
    }
  );
}

function normalizeCurrency(value: string) {
  const numeric = Number.parseInt(value.replace(/[^\d]/g, ""), 10);

  return Number.isNaN(numeric) ? Number.POSITIVE_INFINITY : numeric;
}

function filterCandidates(filters: DashboardFilters): DashboardCandidate[] {
  return dashboardCandidates.filter((candidate) => {
    if (
      filters.resumeScoreMin &&
      candidate.resumeScore < Number.parseInt(filters.resumeScoreMin, 10)
    ) {
      return false;
    }

    if (
      filters.interviewScoreMin &&
      candidate.interviewScore < Number.parseInt(filters.interviewScoreMin, 10)
    ) {
      return false;
    }

    if (filters.joiningTimeline && candidate.joiningTimeline !== filters.joiningTimeline) {
      return false;
    }

    if (
      filters.salaryMax &&
      normalizeCurrency(candidate.salaryExpectation) > normalizeCurrency(filters.salaryMax)
    ) {
      return false;
    }

    if (filters.relocation && candidate.relocation !== filters.relocation) {
      return false;
    }

    if (filters.status && candidate.status !== filters.status) {
      return false;
    }

    return true;
  });
}

export async function getHrDashboard(
  filters: DashboardFilters = {}
): Promise<HrDashboardData> {
  const queryFilters = Object.fromEntries(
    Object.entries(filters).filter((entry): entry is [string, string] => Boolean(entry[1]))
  );
  const query = new URLSearchParams(queryFilters).toString();

  return requestOrFallback(`/hr/dashboard?${query}`, undefined, async () => {
    await sleep(160);
    return {
      ...hrDashboardData,
      candidates: filterCandidates(filters)
    };
  });
}

export async function getApplicationPortal(jobId: string): Promise<ApplicationPortalData> {
  return requestOrFallback(`/jobs/${jobId}/portal`, undefined, async () => {
    await sleep(140);
    return {
      ...applicationPortalData,
      job: {
        ...applicationPortalData.job,
        id: jobId
      }
    };
  });
}

export async function submitCandidateApplication(
  payload: CandidateApplicationPayload
): Promise<ScreeningResult> {
  return requestOrFallback(
    `/jobs/${payload.jobId}/apply`,
    {
      method: "POST",
      body: JSON.stringify(payload)
    },
    async () => {
      await sleep(360);

      const resumeScore = payload.resumeFileName ? screeningResult.resumeScore : 62;
      const salaryExpectation = normalizeCurrency(payload.salaryExpectation);
      const qualificationMatch =
        (payload.joiningTimeline === "30 days" || payload.joiningTimeline === "45 days") &&
        payload.relocation !== "Declined" &&
        salaryExpectation <= 34;
      const shouldAdvance = resumeScore >= 70 && qualificationMatch;

      return {
        ...screeningResult,
        resumeScore,
        qualificationResult: qualificationMatch ? "Pass" : "Stopped",
        qualificationReason: qualificationMatch
          ? screeningResult.qualificationReason
          : "Joining timeline or relocation preference does not match the approved role constraints.",
        nextStep: shouldAdvance ? "Advance to AI interview" : "Store candidate profile only",
        statusMessage:
          shouldAdvance
            ? screeningResult.statusMessage
            : "Candidate is retained in the platform knowledge base but does not progress automatically.",
        interviewQuestions: shouldAdvance ? screeningResult.interviewQuestions : []
      };
    }
  );
}

export async function getCandidateProfile(
  candidateId: string
): Promise<CandidateProfileData> {
  return requestOrFallback(`/candidates/${candidateId}`, undefined, async () => {
    await sleep(180);
    return {
      ...candidateProfile,
      id: candidateId
    };
  });
}
