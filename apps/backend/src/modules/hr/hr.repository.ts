import { query } from "@ai-hiring/database";
import type {
  ApplicationStatus,
  Candidate,
  CandidateInsight,
  CandidateScore,
  HrAnalyticsData,
  HrCandidateApplicationHistoryItem,
  HrCandidateDetail,
  HrCandidateListItem,
  HrDashboardData,
  HrFunnelStage,
  HrJobApplicationItem,
  HrJobDetail,
  HrJobListItem,
  InterviewQuestionAnswer,
  InterviewSession,
  JobStatus
} from "@ai-hiring/shared-types";

import { toNumber } from "../../lib/validation";
import { candidateScoresRepository } from "../applications/candidate-scores.repository";

type CountRow = { count: string };

const COMPLETED_INTERVIEW_STATUSES: ApplicationStatus[] = [
  "INTERVIEW_COMPLETED",
  "SHORTLISTED",
  "HIRED"
];

function normalizeCandidate(candidate: {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  linkedin_url: string | null;
  resume_file_url: string | null;
  resume_text: string | null;
  current_location: string | null;
  total_experience_years: string | null;
  current_company: string | null;
  source: Candidate["source"];
  permanent_profile: Record<string, unknown> | null;
  created_at: Date;
  updated_at: Date;
}): Candidate {
  return {
    id: candidate.id,
    fullName: candidate.full_name,
    email: candidate.email,
    phone: candidate.phone,
    linkedinUrl: candidate.linkedin_url,
    resumeFileUrl: candidate.resume_file_url,
    resumeText: candidate.resume_text,
    currentLocation: candidate.current_location,
    totalExperienceYears: toNumber(candidate.total_experience_years),
    currentCompany: candidate.current_company,
    source: candidate.source,
    permanentProfile: candidate.permanent_profile ?? {},
    createdAt: candidate.created_at.toISOString(),
    updatedAt: candidate.updated_at.toISOString()
  };
}

function normalizeInsight(
  row: {
    id: string;
    candidate_id: string;
    latest_application_id: string | null;
    resume_analysis: Record<string, unknown> | null;
    linkedin_insights: Record<string, unknown> | null;
    interview_transcript: string | null;
    evaluation_scores: Record<string, unknown> | null;
    claim_verification_flags: Array<Record<string, unknown>> | null;
    suggested_manager_questions: string[] | null;
    hiring_recommendation: string | null;
    created_at: Date;
    updated_at: Date;
  },
  applicationHistory: CandidateInsight["applicationHistory"],
  candidateScore: CandidateScore | null
): CandidateInsight {
  return {
    id: row.id,
    candidateId: row.candidate_id,
    latestApplicationId: row.latest_application_id,
    resumeAnalysis: row.resume_analysis ?? {},
    linkedinInsights: row.linkedin_insights ?? {},
    interviewTranscript: row.interview_transcript,
    evaluationScores: row.evaluation_scores ?? {},
    claimVerificationFlags: row.claim_verification_flags ?? [],
    suggestedManagerQuestions: row.suggested_manager_questions ?? [],
    hiringRecommendation: row.hiring_recommendation,
    candidateScore,
    applicationHistory,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString()
  };
}

function normalizeInterviewSession(
  row: {
    id: string;
    application_id: string;
    status: InterviewSession["status"];
    started_at: Date | null;
    completed_at: Date | null;
    communication_score: string | null;
    knowledge_score: string | null;
    confidence_score: string | null;
    overall_score: string | null;
    summary: string | null;
    transcript: string | null;
    created_at: Date;
    updated_at: Date;
  },
  items: InterviewQuestionAnswer[]
): InterviewSession {
  return {
    id: row.id,
    applicationId: row.application_id,
    status: row.status,
    startedAt: row.started_at?.toISOString() ?? null,
    completedAt: row.completed_at?.toISOString() ?? null,
    communicationScore: toNumber(row.communication_score),
    knowledgeScore: toNumber(row.knowledge_score),
    confidenceScore: toNumber(row.confidence_score),
    overallScore: toNumber(row.overall_score),
    summary: row.summary,
    transcript: row.transcript,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
    items
  };
}

function normalizeScreeningResult(row: {
  id: string;
  application_id: string;
  candidate_id: string;
  job_id: string;
  semantic_similarity: string;
  experience_match: string;
  skills_match: string;
  domain_match: string;
  achievements_match: string;
  final_score: string;
  resume_analysis: Record<string, unknown> | null;
  job_analysis: Record<string, unknown> | null;
  reasoning_summary: string | null;
  strengths: string[] | null;
  weaknesses: string[] | null;
  created_at: Date;
  updated_at: Date;
}) {
  return {
    id: row.id,
    applicationId: row.application_id,
    candidateId: row.candidate_id,
    jobId: row.job_id,
    semanticSimilarity: toNumber(row.semantic_similarity) ?? 0,
    experienceMatch: toNumber(row.experience_match) ?? 0,
    skillsMatch: toNumber(row.skills_match) ?? 0,
    domainMatch: toNumber(row.domain_match) ?? 0,
    achievementsMatch: toNumber(row.achievements_match) ?? 0,
    finalScore: toNumber(row.final_score) ?? 0,
    resumeAnalysis: row.resume_analysis ?? {},
    jobAnalysis: row.job_analysis ?? {},
    reasoningSummary: row.reasoning_summary,
    strengths: row.strengths ?? [],
    weaknesses: row.weaknesses ?? [],
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString()
  };
}

export class HrRepository {
  async getDashboard(): Promise<HrDashboardData> {
    const [openPositions, applicationsReceived, interviewsCompleted, shortlisted] =
      await Promise.all([
        query<CountRow>(
          "SELECT COUNT(*)::text AS count FROM jobs WHERE status IN ('APPROVED', 'PUBLISHED')"
        ),
        query<CountRow>("SELECT COUNT(*)::text AS count FROM applications"),
        query<CountRow>(
          "SELECT COUNT(*)::text AS count FROM interview_sessions WHERE status = 'COMPLETED'"
        ),
        query<CountRow>(
          "SELECT COUNT(*)::text AS count FROM applications WHERE status = 'SHORTLISTED'"
        )
      ]);

    const funnelRows = await query<{ label: string; count: string }>(
      `
        SELECT label, count::text
        FROM (
          SELECT 'Applications Received'::text AS label, COUNT(*) AS count FROM applications
          UNION ALL
          SELECT 'Resume Qualified', COUNT(*) FROM applications WHERE status <> 'SCREENING_FAILED'
          UNION ALL
          SELECT 'AI Interviews Completed', COUNT(*) FROM interview_sessions WHERE status = 'COMPLETED'
          UNION ALL
          SELECT 'Candidates Shortlisted', COUNT(*) FROM applications WHERE status = 'SHORTLISTED'
        ) funnel
      `
    );

    return {
      openPositions: Number(openPositions.rows[0]?.count ?? 0),
      applicationsReceived: Number(applicationsReceived.rows[0]?.count ?? 0),
      aiInterviewsCompleted: Number(interviewsCompleted.rows[0]?.count ?? 0),
      candidatesShortlisted: Number(shortlisted.rows[0]?.count ?? 0),
      funnel: funnelRows.rows.map<HrFunnelStage>((row) => ({
        label: row.label,
        value: Number(row.count)
      }))
    };
  }

  async listJobs(): Promise<HrJobListItem[]> {
    const result = await query<{
      id: string;
      title: string;
      posted_by: string | null;
      location: string | null;
      applications_count: string;
      status: JobStatus;
      created_at: Date;
    }>(
      `
        SELECT
          jobs.id,
          jobs.title,
          users.full_name AS posted_by,
          jobs.location,
          COUNT(applications.id)::text AS applications_count,
          jobs.status,
          jobs.created_at
        FROM jobs
        LEFT JOIN users ON users.id = jobs.created_by
        LEFT JOIN applications ON applications.job_id = jobs.id
        GROUP BY jobs.id, users.full_name
        ORDER BY jobs.created_at DESC
      `
    );

    return result.rows.map((row) => ({
      id: row.id,
      title: row.title,
      postedBy: row.posted_by ?? "Unknown manager",
      location: row.location,
      applicationsCount: Number(row.applications_count),
      status: row.status,
      createdAt: row.created_at.toISOString()
    }));
  }

  async getJobDetail(jobId: string): Promise<HrJobDetail | null> {
    const jobResult = await query<{
      id: string;
      title: string;
      location: string | null;
      status: JobStatus;
      created_at: Date;
      generated_description: string;
      approved_description: string | null;
      manager_id: string | null;
      manager_name: string | null;
      manager_email: string | null;
    }>(
      `
        SELECT
          jobs.id,
          jobs.title,
          jobs.location,
          jobs.status,
          jobs.created_at,
          jobs.generated_description,
          jobs.approved_description,
          users.id AS manager_id,
          users.full_name AS manager_name,
          users.email AS manager_email
        FROM jobs
        LEFT JOIN users ON users.id = jobs.created_by
        WHERE jobs.id = $1
        LIMIT 1
      `,
      [jobId]
    );

    const job = jobResult.rows[0];
    if (!job) {
      return null;
    }

    const candidates = await this.listJobApplications(jobId);
    const pipeline = [
      {
        label: "Applied",
        value: candidates.length
      },
      {
        label: "Resume Qualified",
        value: candidates.filter((candidate) => candidate.status !== "SCREENING_FAILED").length
      },
      {
        label: "AI Interviews Completed",
        value: candidates.filter((candidate) =>
          COMPLETED_INTERVIEW_STATUSES.includes(candidate.status)
        ).length
      },
      {
        label: "Shortlisted",
        value: candidates.filter((candidate) => candidate.status === "SHORTLISTED").length
      }
    ];

    return {
      id: job.id,
      title: job.title,
      location: job.location,
      status: job.status,
      createdAt: job.created_at.toISOString(),
      hiringManager: job.manager_id
        ? {
            id: job.manager_id,
            fullName: job.manager_name ?? "Unknown manager",
            email: job.manager_email ?? ""
          }
        : null,
      description: job.approved_description ?? job.generated_description,
      candidatePipeline: pipeline,
      candidates
    };
  }

  async listJobApplications(jobId: string): Promise<HrJobApplicationItem[]> {
    const result = await query<{
      application_id: string;
      candidate_id: string;
      candidate_name: string;
      candidate_email: string;
      resume_score: string | null;
      interview_score: string | null;
      candidate_score: string | null;
      candidate_score_confidence_label: string | null;
      joining_timeline: string | null;
      salary_expectation: string | null;
      relocation: boolean | null;
      status: ApplicationStatus;
      applied_at: Date;
    }>(
      `
        SELECT
          applications.id AS application_id,
          candidates.id AS candidate_id,
          candidates.full_name AS candidate_name,
          candidates.email AS candidate_email,
          applications.resume_match_score AS resume_score,
          applications.interview_score AS interview_score,
          candidate_scores.final_score AS candidate_score,
          candidate_scores.confidence_label AS candidate_score_confidence_label,
          applications.qualification_answers->>'joiningTimeline' AS joining_timeline,
          applications.qualification_answers->>'expectedSalary' AS salary_expectation,
          CASE
            WHEN applications.qualification_answers ? 'relocationWillingness'
            THEN (applications.qualification_answers->>'relocationWillingness')::boolean
            ELSE NULL
          END AS relocation,
          applications.status,
          applications.applied_at
        FROM applications
        INNER JOIN candidates ON candidates.id = applications.candidate_id
        LEFT JOIN candidate_scores ON candidate_scores.application_id = applications.id
        WHERE applications.job_id = $1
        ORDER BY applications.applied_at DESC
      `,
      [jobId]
    );

    return result.rows.map((row) => ({
      applicationId: row.application_id,
      candidateId: row.candidate_id,
      candidateName: row.candidate_name,
      candidateEmail: row.candidate_email,
      resumeScore: toNumber(row.resume_score),
      interviewScore: toNumber(row.interview_score),
      candidateScore: toNumber(row.candidate_score),
      candidateScoreConfidenceLabel: row.candidate_score_confidence_label,
      joiningTimeline: row.joining_timeline,
      salaryExpectation: toNumber(row.salary_expectation),
      relocation: row.relocation,
      status: row.status,
      appliedAt: row.applied_at.toISOString()
    }));
  }

  async listCandidates(): Promise<HrCandidateListItem[]> {
    const result = await query<{
      id: string;
      full_name: string;
      email: string;
      current_company: string | null;
      latest_job_title: string | null;
      latest_status: ApplicationStatus | null;
      resume_score: string | null;
      interview_score: string | null;
      candidate_score: string | null;
      candidate_score_confidence_label: string | null;
      applied_at: Date | null;
    }>(
      `
        SELECT
          candidates.id,
          candidates.full_name,
          candidates.email,
          candidates.current_company,
          jobs.title AS latest_job_title,
          applications.status AS latest_status,
          applications.resume_match_score AS resume_score,
          applications.interview_score AS interview_score,
          candidate_scores.final_score AS candidate_score,
          candidate_scores.confidence_label AS candidate_score_confidence_label,
          applications.applied_at
        FROM candidates
        LEFT JOIN LATERAL (
          SELECT *
          FROM applications
          WHERE applications.candidate_id = candidates.id
          ORDER BY applications.applied_at DESC
          LIMIT 1
        ) applications ON TRUE
        LEFT JOIN candidate_scores ON candidate_scores.application_id = applications.id
        LEFT JOIN jobs ON jobs.id = applications.job_id
        ORDER BY applications.applied_at DESC NULLS LAST, candidates.created_at DESC
      `
    );

    return result.rows.map((row) => ({
      id: row.id,
      name: row.full_name,
      email: row.email,
      currentCompany: row.current_company,
      latestJobTitle: row.latest_job_title,
      latestApplicationStatus: row.latest_status,
      resumeScore: toNumber(row.resume_score),
      interviewScore: toNumber(row.interview_score),
      candidateScore: toNumber(row.candidate_score),
      candidateScoreConfidenceLabel: row.candidate_score_confidence_label,
      appliedAt: row.applied_at?.toISOString() ?? null
    }));
  }

  async getCandidateDetail(candidateId: string): Promise<HrCandidateDetail | null> {
    const candidateResult = await query<{
      id: string;
      full_name: string;
      email: string;
      phone: string | null;
      linkedin_url: string | null;
      resume_file_url: string | null;
      resume_text: string | null;
      current_location: string | null;
      total_experience_years: string | null;
      current_company: string | null;
      source: Candidate["source"];
      permanent_profile: Record<string, unknown> | null;
      created_at: Date;
      updated_at: Date;
    }>("SELECT * FROM candidates WHERE id = $1 LIMIT 1", [candidateId]);

    const candidateRow = candidateResult.rows[0];
    if (!candidateRow) {
      return null;
    }

    const applicationsResult = await query<{
      application_id: string;
      job_id: string;
      job_title: string;
      status: ApplicationStatus;
      applied_at: Date;
      resume_score: string | null;
      interview_score: string | null;
      candidate_score: string | null;
      candidate_score_confidence_label: string | null;
    }>(
      `
        SELECT
          applications.id AS application_id,
          jobs.id AS job_id,
          jobs.title AS job_title,
          applications.status,
          applications.applied_at,
          applications.resume_match_score AS resume_score,
          applications.interview_score AS interview_score,
          candidate_scores.final_score AS candidate_score,
          candidate_scores.confidence_label AS candidate_score_confidence_label
        FROM applications
        INNER JOIN jobs ON jobs.id = applications.job_id
        LEFT JOIN candidate_scores ON candidate_scores.application_id = applications.id
        WHERE applications.candidate_id = $1
        ORDER BY applications.applied_at DESC
      `,
      [candidateId]
    );

    const applications = applicationsResult.rows.map<HrCandidateApplicationHistoryItem>((row) => ({
      applicationId: row.application_id,
      jobId: row.job_id,
      jobTitle: row.job_title,
      status: row.status,
      appliedAt: row.applied_at.toISOString(),
      resumeScore: toNumber(row.resume_score),
      interviewScore: toNumber(row.interview_score),
      candidateScore: toNumber(row.candidate_score),
      candidateScoreConfidenceLabel: row.candidate_score_confidence_label
    }));

    const [insightResult, latestCandidateScore] = await Promise.all([
      query<{
      id: string;
      candidate_id: string;
      latest_application_id: string | null;
      resume_analysis: Record<string, unknown> | null;
      linkedin_insights: Record<string, unknown> | null;
      interview_transcript: string | null;
      evaluation_scores: Record<string, unknown> | null;
      claim_verification_flags: Array<Record<string, unknown>> | null;
      suggested_manager_questions: string[] | null;
      hiring_recommendation: string | null;
      created_at: Date;
      updated_at: Date;
    }>(
      "SELECT * FROM candidate_insights WHERE candidate_id = $1 LIMIT 1",
      [candidateId]
    ),
      candidateScoresRepository.findLatestByCandidateId(candidateId)
    ]);

    const interviewRows = await query<{
      id: string;
      application_id: string;
      status: InterviewSession["status"];
      started_at: Date | null;
      completed_at: Date | null;
      communication_score: string | null;
      knowledge_score: string | null;
      confidence_score: string | null;
      overall_score: string | null;
      summary: string | null;
      transcript: string | null;
      created_at: Date;
      updated_at: Date;
    }>(
      `
        SELECT interview_sessions.*
        FROM interview_sessions
        INNER JOIN applications ON applications.id = interview_sessions.application_id
        WHERE applications.candidate_id = $1
        ORDER BY interview_sessions.created_at DESC
      `,
      [candidateId]
    );

    const screeningResultRows = await query<{
      id: string;
      application_id: string;
      candidate_id: string;
      job_id: string;
      semantic_similarity: string;
      experience_match: string;
      skills_match: string;
      domain_match: string;
      achievements_match: string;
      final_score: string;
      resume_analysis: Record<string, unknown> | null;
      job_analysis: Record<string, unknown> | null;
      reasoning_summary: string | null;
      strengths: string[] | null;
      weaknesses: string[] | null;
      created_at: Date;
      updated_at: Date;
    }>(
      `
        SELECT screening_results.*
        FROM screening_results
        WHERE screening_results.candidate_id = $1
        ORDER BY screening_results.created_at DESC
      `,
      [candidateId]
    );

    const itemsRows = await query<{
      id: string;
      session_id: string;
      question: string;
      answer: string;
      evaluation_score: string;
      created_at: Date;
    }>(
      `
        SELECT interview_items.*
        FROM interview_items
        INNER JOIN interview_sessions ON interview_sessions.id = interview_items.session_id
        INNER JOIN applications ON applications.id = interview_sessions.application_id
        WHERE applications.candidate_id = $1
        ORDER BY interview_items.created_at ASC
      `,
      [candidateId]
    );

    const itemsBySession = new Map<string, InterviewQuestionAnswer[]>();
    for (const item of itemsRows.rows) {
      const nextItem: InterviewQuestionAnswer = {
        id: item.id,
        sessionId: item.session_id,
        question: item.question,
        answer: item.answer,
        evaluationScore: Number(item.evaluation_score),
        createdAt: item.created_at.toISOString()
      };
      const current = itemsBySession.get(item.session_id) ?? [];
      current.push(nextItem);
      itemsBySession.set(item.session_id, current);
    }

    return {
      candidate: normalizeCandidate(candidateRow),
      insight: insightResult.rows[0]
        ? normalizeInsight(
            insightResult.rows[0],
            applications.map((item) => ({
              jobTitle: item.jobTitle,
              status: item.status,
              appliedAt: item.appliedAt
            })),
            latestCandidateScore
          )
        : null,
      applications,
      interviews: interviewRows.rows.map((row) =>
        normalizeInterviewSession(row, itemsBySession.get(row.id) ?? [])
      ),
      screeningResults: screeningResultRows.rows.map(normalizeScreeningResult)
    };
  }

  async getAnalytics(): Promise<HrAnalyticsData> {
    const [applicationsPerJob, interviewCompletionRate, averageScores] = await Promise.all([
      query<{
        job_id: string;
        job_title: string;
        applications_count: string;
      }>(
        `
          SELECT jobs.id AS job_id, jobs.title AS job_title, COUNT(applications.id)::text AS applications_count
          FROM jobs
          LEFT JOIN applications ON applications.job_id = jobs.id
          GROUP BY jobs.id
          ORDER BY COUNT(applications.id) DESC, jobs.created_at DESC
        `
      ),
      query<{
        completed_count: string;
        total_count: string;
      }>(
        `
          SELECT
            COUNT(*) FILTER (WHERE status = 'COMPLETED')::text AS completed_count,
            COUNT(*)::text AS total_count
          FROM interview_sessions
        `
      ),
      query<{
        average_resume_score: string | null;
        average_interview_score: string | null;
      }>(
        `
          SELECT
            AVG(resume_match_score)::text AS average_resume_score,
            AVG(interview_score)::text AS average_interview_score
          FROM applications
        `
      )
    ]);

    const totals = interviewCompletionRate.rows[0];
    const completed = Number(totals?.completed_count ?? 0);
    const total = Number(totals?.total_count ?? 0);

    return {
      applicationsPerJob: applicationsPerJob.rows.map((row) => ({
        jobId: row.job_id,
        jobTitle: row.job_title,
        applicationsCount: Number(row.applications_count)
      })),
      interviewCompletionRate: total === 0 ? 0 : Number(((completed / total) * 100).toFixed(1)),
      averageResumeScore: toNumber(averageScores.rows[0]?.average_resume_score),
      averageInterviewScore: toNumber(averageScores.rows[0]?.average_interview_score)
    };
  }
}

export const hrRepository = new HrRepository();
