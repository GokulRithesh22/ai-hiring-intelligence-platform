import "server-only";

import { getCandidateProfile as getFallbackCandidateProfile } from "@/lib/api-adapters";
import type { CandidateProfileData, HrCandidateDetail } from "@/lib/types";
import { getHrSession } from "@/lib/hr-auth";
import { getManagerSession } from "@/lib/manager-auth";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

function mapHrCandidateDetailToCandidateProfile(profile: HrCandidateDetail): CandidateProfileData {
  const latestApplication = profile.applications[0] ?? null;
  const latestInterview = profile.interviews[0] ?? null;
  const latestScreening = profile.screeningResults[0] ?? null;
  const candidateScore = profile.insight?.candidateScore ?? null;
  const resumeAnalysis = profile.insight?.resumeAnalysis ?? latestScreening?.resumeAnalysis ?? {};
  const interviewTranscript = latestInterview?.items ?? [];
  const recommendationSummary =
    profile.insight?.hiringRecommendation ??
    latestScreening?.reasoningSummary ??
    "Internal candidate intelligence is available for further review.";

  return {
    id: profile.candidate.id,
    name: profile.candidate.fullName,
    currentRole: profile.candidate.currentCompany ?? "Role not yet captured",
    location: profile.candidate.currentLocation ?? "Location unavailable",
    overview:
      latestScreening?.reasoningSummary ??
      "Semantic screening and interview evidence are available for internal review.",
    resumeScore: latestScreening ? `${latestScreening.finalScore} / 100` : "Pending",
    resumeSynopsis: latestScreening
      ? `Semantic alignment ${latestScreening.semanticSimilarity} with strengths in ${latestScreening.strengths.slice(0, 2).join(", ") || "resume fit"}.`
      : "Resume screening has not been finalized yet.",
    interviewScore: latestInterview?.overallScore ? `${latestInterview.overallScore} / 100` : "Pending",
    interviewSummary:
      latestInterview?.summary ??
      "Interview evidence will appear after the AI interview is completed.",
    applicationHistory: profile.applications.map((application) => ({
      jobTitle: application.jobTitle,
      date: new Date(application.appliedAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }),
      status: application.status,
      statusClass:
        application.status === "SHORTLISTED"
          ? "status-shortlisted"
          : application.status === "REJECTED" || application.status === "SCREENING_FAILED"
            ? "status-review"
            : "status-progress",
      notes:
        application.resumeScore != null
          ? `Resume score ${application.resumeScore}${application.interviewScore != null ? `, interview score ${application.interviewScore}` : ""}.`
          : "Application stored in the hiring pipeline."
    })),
    resumeInsights: JSON.stringify(resumeAnalysis, null, 2),
    linkedInInsights: profile.candidate.linkedinUrl
      ? `LinkedIn URL captured: ${profile.candidate.linkedinUrl}`
      : "No LinkedIn profile supplied.",
    interviewTranscript: interviewTranscript.map((item) => ({
      question: item.question,
      answer: item.answer,
      score: `${item.evaluationScore} / 100`
    })),
    claimVerification:
      profile.insight?.claimVerificationFlags.length
        ? profile.insight.claimVerificationFlags.map((flag) => JSON.stringify(flag)).join(" | ")
        : "No claim verification flags recorded.",
    suggestedQuestions:
      profile.insight?.suggestedManagerQuestions.length
        ? profile.insight.suggestedManagerQuestions
        : latestScreening?.weaknesses.map((item) => `Probe further on ${item}.`) ?? [],
    scoreEngine: {
      finalScore:
        candidateScore?.finalScore != null ? `${candidateScore.finalScore} / 100` : "Pending",
      confidence:
        candidateScore?.confidenceScore != null
          ? `${Math.round(candidateScore.confidenceScore * 100)}% (${candidateScore.confidenceLabel})`
          : "Pending",
      roleCapability:
        candidateScore?.roleCapability != null ? String(candidateScore.roleCapability) : "Pending",
      thinkingBehavior:
        candidateScore?.thinkingBehavior != null
          ? String(candidateScore.thinkingBehavior)
          : "Pending",
      impact: candidateScore?.impact != null ? String(candidateScore.impact) : "Pending",
      transferability:
        candidateScore?.transferability != null
          ? String(candidateScore.transferability)
          : "Pending",
      potential: candidateScore?.potential != null ? String(candidateScore.potential) : "Pending",
      evidence: candidateScore?.evidenceSummary ?? []
    },
    scoreBreakdown: {
      communication:
        latestInterview?.communicationScore != null
          ? String(latestInterview.communicationScore)
          : "Pending",
      knowledge:
        latestInterview?.knowledgeScore != null ? String(latestInterview.knowledgeScore) : "Pending",
      confidence:
        latestInterview?.confidenceScore != null
          ? String(latestInterview.confidenceScore)
          : "Pending",
      overall:
        latestInterview?.overallScore != null ? String(latestInterview.overallScore) : "Pending"
    },
    recommendation: {
      label: latestApplication?.status ?? "Internal review",
      title:
        latestScreening?.finalScore && latestScreening.finalScore >= 70
          ? "Proceed"
          : "Review manually",
      summary: candidateScore?.summary ?? recommendationSummary,
      statusClass:
        candidateScore?.recommendation === "advance" ||
        (candidateScore == null &&
          latestScreening?.finalScore &&
          latestScreening.finalScore >= 70)
          ? "status-approved"
          : "status-progress",
      highlights:
        candidateScore?.evidenceSummary?.length
          ? candidateScore.evidenceSummary
          : latestScreening?.strengths.length
            ? latestScreening.strengths
            : ["Semantic screening data is available for internal review."]
    }
  };
}

export async function getProtectedCandidateProfile(
  candidateId: string
): Promise<CandidateProfileData> {
  if (!apiBaseUrl) {
    return getFallbackCandidateProfile(candidateId);
  }

  const managerSession = await getManagerSession();
  if (managerSession) {
    const response = await fetch(`${apiBaseUrl}/candidates/${candidateId}/intelligence`, {
      headers: {
        Authorization: `Bearer ${managerSession.accessToken}`
      },
      cache: "no-store"
    });

    if (response.ok) {
      return mapHrCandidateDetailToCandidateProfile((await response.json()) as HrCandidateDetail);
    }
  }

  const hrSession = await getHrSession();
  if (hrSession) {
    const response = await fetch(`${apiBaseUrl}/hr/candidates/${candidateId}`, {
      headers: {
        Authorization: `Bearer ${hrSession.accessToken}`
      },
      cache: "no-store"
    });

    if (response.ok) {
      return mapHrCandidateDetailToCandidateProfile((await response.json()) as HrCandidateDetail);
    }
  }

  return getFallbackCandidateProfile(candidateId);
}
