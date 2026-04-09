import Link from "next/link";

import type { ManagerDashboardData, ManagerJobCardData } from "@/lib/types";

type ManagerHiringDashboardProps = {
  data: ManagerDashboardData;
};

function getStatusClass(status: string) {
  if (status === "PUBLISHED" || status === "APPROVED") {
    return "status-approved";
  }

  if (status === "PENDING_HR_APPROVAL") {
    return "status-pending";
  }

  if (status === "REJECTED" || status === "CLOSED") {
    return "status-rejected";
  }

  return "status-progress";
}

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function JobCard({ job }: { job: ManagerJobCardData }) {
  const maxStageCount = Math.max(...job.pipelineDistribution.map((stage) => stage.count), 1);

  return (
    <article className="card stack-lg" style={{ padding: 24 }}>
      <div className="panel-heading">
        <div className="stack" style={{ gap: 10 }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <span className={`status-pill ${getStatusClass(job.status)}`}>{formatStatus(job.status)}</span>
            <span className="subtle-label">{job.location}</span>
          </div>
          <div>
            <h2 style={{ marginBottom: 8 }}>{job.title}</h2>
            <p className="muted" style={{ margin: 0 }}>
              {job.descriptionPreview}
            </p>
          </div>
        </div>

        <Link className="button button-secondary" href={`/dashboard/jobs/${job.id}`}>
          Open candidate pipeline
        </Link>
      </div>

      <div className="summary-grid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
        <article className="summary-chip">
          <span className="subtle-label">Applicants</span>
          <strong>{job.applicantsCount}</strong>
          <span className="muted">Current pipeline size</span>
        </article>
        <article className="summary-chip">
          <span className="subtle-label">Shortlisted</span>
          <strong>{job.shortlistedCount}</strong>
          <span className="muted">Ready for recruiter review</span>
        </article>
        <article className="summary-chip">
          <span className="subtle-label">Updated</span>
          <strong>{formatDate(job.updatedAt)}</strong>
          <span className="muted">Created {formatDate(job.createdAt)}</span>
        </article>
      </div>

      <div className="stack" style={{ gap: 12 }}>
        <div className="panel-heading">
          <div>
            <span className="subtle-label">Pipeline distribution</span>
            <h3>Candidate flow for this JD</h3>
          </div>
          <span className="muted">{job.pipelineDistribution.length} tracked stages</span>
        </div>

        <div className="timeline-list">
          {job.pipelineDistribution.map((stage) => (
            <article className="history-item" key={`${job.id}-${stage.label}`} style={{ padding: 16 }}>
              <div className="panel-heading">
                <div>
                  <strong>{stage.label}</strong>
                  <p className="muted" style={{ margin: "6px 0 0" }}>
                    {stage.count} candidates
                  </p>
                </div>
                <span className="status-pill status-progress">
                  {Math.round((stage.count / maxStageCount) * 100)}%
                </span>
              </div>
              <div
                style={{
                  width: `${Math.max(12, (stage.count / maxStageCount) * 100)}%`,
                  height: 8,
                  borderRadius: 999,
                  background:
                    "linear-gradient(90deg, rgba(74,108,247,0.92), rgba(54,198,160,0.85))"
                }}
              />
            </article>
          ))}
        </div>
      </div>
    </article>
  );
}

export function ManagerHiringDashboard({ data }: ManagerHiringDashboardProps) {
  return (
    <div className="stack-lg">
      <section className="cta-strip">
        <div>
          <span className="subtle-label" style={{ color: "rgba(255,255,255,0.78)" }}>
            Recruiter control center
          </span>
          <h2 style={{ margin: "8px 0 0" }}>Create, compare, and steer multiple hiring pipelines</h2>
          <p>Launch a new JD, manage publishing states, and jump straight into candidate evidence.</p>
        </div>

        <Link className="button button-secondary" href="/dashboard/jobs/create">
          Create Job
        </Link>
      </section>

      <section className="stats-grid">
        {data.metrics.map((metric) => (
          <article className="card" key={metric.label}>
            <span className="subtle-label">{metric.label}</span>
            <span className="stat-value">{metric.value}</span>
            <span className="muted">{metric.context}</span>
          </article>
        ))}
      </section>

      <section className="stack-lg">
        <div className="panel-heading">
          <div>
            <span className="subtle-label">Job descriptions</span>
            <h2>Active JDs and pipeline health</h2>
          </div>
          <Link className="button button-primary" href="/dashboard/jobs/create">
            New draft
          </Link>
        </div>

        <div
          style={{
            display: "grid",
            gap: 20,
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))"
          }}
        >
          {data.jobs.map((job) => (
            <JobCard job={job} key={job.id} />
          ))}
        </div>
      </section>
    </div>
  );
}
