import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getProtectedHrCandidate } from "@/lib/hr-api";
import { requireHrSession } from "@/lib/hr-auth";

type HrCandidatePageProps = {
  params: Promise<{
    candidateId: string;
  }>;
};

function formatJsonBlock(value: Record<string, unknown> | null | undefined) {
  if (!value || Object.keys(value).length === 0) {
    return "No structured insight stored yet.";
  }

  return JSON.stringify(value, null, 2);
}

export default async function HrCandidatePage({ params }: HrCandidatePageProps) {
  await requireHrSession();
  const { candidateId } = await params;
  const profile = await getProtectedHrCandidate(candidateId);

  return (
    <DashboardShell
      eyebrow="HR Candidate Intelligence"
      title={`${profile.candidate.fullName} intelligence view`}
      description="Review the full candidate memory including applications, resume and LinkedIn analysis, interview transcript evidence, verification flags, and manager-ready follow-up prompts."
    >
      <div className="stack-lg">
        <section className="overview-panel card stack-lg">
          <div className="panel-heading">
            <div>
              <span className="subtle-label">Candidate overview</span>
              <h2>{profile.candidate.fullName}</h2>
              <p className="supporting-copy">
                {profile.candidate.currentCompany ?? "Current company unavailable"} •{" "}
                {profile.candidate.currentLocation ?? "Location unavailable"}
              </p>
            </div>
            <span className="status-pill status-progress">
              {profile.applications[0]?.status ?? "No application yet"}
            </span>
          </div>

          <div className="overview-grid">
            <article className="summary-chip">
              <span className="subtle-label">Email</span>
              <strong>{profile.candidate.email}</strong>
              <span className="muted">Primary contact</span>
            </article>
            <article className="summary-chip">
              <span className="subtle-label">LinkedIn</span>
              <strong>{profile.candidate.linkedinUrl ?? "Unavailable"}</strong>
              <span className="muted">Professional profile</span>
            </article>
            <article className="summary-chip">
              <span className="subtle-label">Experience</span>
              <strong>{profile.candidate.totalExperienceYears ?? "NA"} years</strong>
              <span className="muted">Career progression</span>
            </article>
            <article className="summary-chip">
              <span className="subtle-label">Applications</span>
              <strong>{profile.applications.length}</strong>
              <span className="muted">Tracked in the platform</span>
            </article>
          </div>
        </section>

        <section className="transcript-grid">
          <div className="transcript-panel card stack-lg">
            <div className="panel-heading">
              <div>
                <span className="subtle-label">Application history</span>
                <h2>Role movement and pipeline outcomes</h2>
              </div>
            </div>

            <div className="history-list">
              {profile.applications.map((application) => (
                <article className="history-item" key={application.applicationId}>
                  <div className="panel-heading">
                    <div>
                      <strong>{application.jobTitle}</strong>
                      <p className="muted">{new Date(application.appliedAt).toLocaleString("en-IN")}</p>
                    </div>
                    <span className="status-pill status-progress">{application.status}</span>
                  </div>
                  <p className="muted">
                    Resume score: {application.resumeScore ?? "NA"} • Interview score:{" "}
                    {application.interviewScore ?? "NA"}
                  </p>
                </article>
              ))}
            </div>

            <div className="panel-heading">
              <div>
                <span className="subtle-label">Interview transcript</span>
                <h2>Question-by-question evidence</h2>
              </div>
            </div>

            <div className="timeline-list">
              {profile.interviews.flatMap((session) =>
                (session.items ?? []).map((item) => (
                  <article className="transcript-entry" key={item.id}>
                    <strong>{item.question}</strong>
                    <p>{item.answer}</p>
                    <span className="muted">Evaluation score: {item.evaluationScore}</span>
                  </article>
                ))
              )}
            </div>
          </div>

          <div className="stack-lg">
            <section className="overview-panel card stack-lg">
              <div className="panel-heading">
                <div>
                  <span className="subtle-label">Resume and LinkedIn insights</span>
                  <h2>Structured candidate intelligence</h2>
                </div>
              </div>

              <div className="insight-grid">
                <article className="insight-item">
                  <strong>Resume insights</strong>
                  <p className="muted" style={{ whiteSpace: "pre-wrap" }}>
                    {formatJsonBlock(profile.insight?.resumeAnalysis)}
                  </p>
                </article>
                <article className="insight-item">
                  <strong>LinkedIn insights</strong>
                  <p className="muted" style={{ whiteSpace: "pre-wrap" }}>
                    {formatJsonBlock(profile.insight?.linkedinInsights)}
                  </p>
                </article>
                <article className="insight-item">
                  <strong>Claim verification flags</strong>
                  <p className="muted" style={{ whiteSpace: "pre-wrap" }}>
                    {profile.insight?.claimVerificationFlags.length
                      ? JSON.stringify(profile.insight.claimVerificationFlags, null, 2)
                      : "No flags recorded."}
                  </p>
                </article>
                <article className="insight-item">
                  <strong>Suggested interview questions</strong>
                  <p className="muted">
                    {profile.insight?.suggestedManagerQuestions.length
                      ? profile.insight.suggestedManagerQuestions.join(" | ")
                      : "No suggested questions recorded."}
                  </p>
                </article>
              </div>
            </section>

            <section className="question-panel card stack-lg">
              <div className="panel-heading">
                <div>
                  <span className="subtle-label">Interview scores</span>
                  <h2>Communication, knowledge, confidence, and overall fit</h2>
                </div>
              </div>

              <div className="score-grid">
                <article className="score-card">
                  <strong>{profile.interviews[0]?.communicationScore ?? "NA"}</strong>
                  <span className="muted">Communication</span>
                </article>
                <article className="score-card">
                  <strong>{profile.interviews[0]?.knowledgeScore ?? "NA"}</strong>
                  <span className="muted">Knowledge</span>
                </article>
                <article className="score-card">
                  <strong>{profile.interviews[0]?.confidenceScore ?? "NA"}</strong>
                  <span className="muted">Confidence</span>
                </article>
                <article className="score-card">
                  <strong>{profile.interviews[0]?.overallScore ?? "NA"}</strong>
                  <span className="muted">Overall</span>
                </article>
              </div>
            </section>

            <section className="recommendation-panel stack-lg">
              <div>
                <span className="subtle-label" style={{ color: "rgba(255,255,255,0.82)" }}>
                  AI hiring recommendation
                </span>
                <h2 style={{ margin: "10px 0 0" }}>
                  {profile.insight?.hiringRecommendation ?? "Recommendation pending"}
                </h2>
                <p>{profile.interviews[0]?.summary ?? "Interview summary not stored yet."}</p>
              </div>
            </section>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
