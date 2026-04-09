import Link from "next/link";

import type { ManagerJobIntelligenceDetail } from "@/lib/types";

type ManagerJobIntelligenceProps = {
  data: ManagerJobIntelligenceDetail;
};

function getStatusClass(status: string) {
  if (status === "SHORTLISTED") {
    return "status-shortlisted";
  }

  if (status === "INTERVIEW_COMPLETED" || status === "INTERVIEW_PENDING") {
    return "status-progress";
  }

  if (status.includes("FAILED") || status === "REJECTED") {
    return "status-rejected";
  }

  return "status-pending";
}

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function ManagerJobIntelligence({ data }: ManagerJobIntelligenceProps) {
  const topStages = data.job.pipelineDistribution.slice(0, 4);

  return (
    <div className="stack-lg">
      <section className="summary-grid">
        <article className="summary-chip">
          <span className="subtle-label">Job description</span>
          <strong>{data.job.title}</strong>
          <span className="muted">{data.job.location}</span>
        </article>
        <article className="summary-chip">
          <span className="subtle-label">Applicants</span>
          <strong>{data.job.applicantsCount}</strong>
          <span className="muted">All candidates tied to this pipeline</span>
        </article>
        <article className="summary-chip">
          <span className="subtle-label">Shortlisted</span>
          <strong>{data.job.shortlistedCount}</strong>
          <span className="muted">Highest-priority manager reviews</span>
        </article>
        <article className="summary-chip">
          <span className="subtle-label">Status</span>
          <strong>{formatStatus(data.job.status)}</strong>
          <span className="muted">Current JD lifecycle state</span>
        </article>
      </section>

      <section className="card stack-lg" style={{ padding: 28 }}>
        <div className="panel-heading">
          <div>
            <span className="subtle-label">Pipeline snapshot</span>
            <h2>Candidate intelligence entry points for this JD</h2>
          </div>
          <Link className="button button-secondary" href="/manager/jobs">
            Back to manager dashboard
          </Link>
        </div>

        <div className="timeline-list">
          {topStages.map((stage) => (
            <article className="history-item" key={stage.label} style={{ padding: 18 }}>
              <div className="panel-heading">
                <div>
                  <strong>{stage.label}</strong>
                  <p className="muted" style={{ margin: "6px 0 0" }}>
                    {stage.count} candidates currently in this stage
                  </p>
                </div>
                <span className="status-pill status-progress">{stage.count}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="stack-lg">
        <div className="panel-heading">
          <div>
            <span className="subtle-label">Candidate intelligence</span>
            <h2>Open evidence-backed candidate profiles</h2>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gap: 18,
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))"
          }}
        >
          {data.candidates.map((candidate) => (
            <article className="card stack" key={candidate.applicationId} style={{ padding: 22 }}>
              <div className="panel-heading">
                <div>
                  <span className={`status-pill ${getStatusClass(candidate.status)}`}>
                    {formatStatus(candidate.status)}
                  </span>
                  <h3 style={{ margin: "12px 0 6px" }}>{candidate.candidateName}</h3>
                  <p className="muted" style={{ margin: 0 }}>
                    {candidate.currentTitle ?? "Candidate title pending"} at{" "}
                    {candidate.currentCompany ?? "latest company pending"}
                  </p>
                </div>
              </div>

              <div className="summary-grid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
                <article className="summary-chip">
                  <span className="subtle-label">Resume score</span>
                  <strong>{candidate.resumeScore ?? "Pending"}</strong>
                </article>
                <article className="summary-chip">
                  <span className="subtle-label">Interview score</span>
                  <strong>{candidate.interviewScore ?? "Pending"}</strong>
                </article>
              </div>

              <div className="summary-chip">
                <span className="subtle-label">AI summary</span>
                <span className="muted">{candidate.insightSummary}</span>
              </div>

              <div className="shell-actions">
                <Link className="button button-primary" href={`/manager/candidates/${candidate.candidateId}`}>
                  Open candidate intelligence
                </Link>
                <span className="muted">Application {candidate.applicationId}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
