import Link from "next/link";

import type { RecruiterOverviewData } from "@/lib/types";

type RecruiterDashboardProps = {
  data: RecruiterOverviewData;
};

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function RecruiterDashboard({ data }: RecruiterDashboardProps) {
  const funnelMax = Math.max(...data.funnel.map((stage) => stage.value), 1);

  return (
    <div className="stack-lg">
      <section className="stats-grid">
        {data.metrics.map((metric) => (
          <article className="card" key={metric.label}>
            <span className="subtle-label">{metric.label}</span>
            <span className="stat-value">{metric.value}</span>
            <span className="muted">{metric.context}</span>
          </article>
        ))}
      </section>

      <section className="summary-grid" style={{ gridTemplateColumns: "1.4fr 1fr" }}>
        <article className="card stack-lg">
          <div className="panel-heading">
            <div>
              <span className="subtle-label">Job management</span>
              <h2>Visible jobs in recruiter workspace</h2>
            </div>
            <Link className="button button-secondary" href="/dashboard/jobs">
              Open jobs
            </Link>
          </div>

          <div className="timeline-list">
            {data.jobs.slice(0, 4).map((job) => (
              <article className="history-item" key={job.id} style={{ padding: 16 }}>
                <div className="panel-heading">
                  <div>
                    <strong>{job.title}</strong>
                    <p className="muted" style={{ margin: "6px 0 0" }}>
                      {job.location ?? "Flexible / remote"} • {job.applicantsCount} applicants
                    </p>
                  </div>
                  <span className="status-pill status-progress">{formatStatus(job.status)}</span>
                </div>
              </article>
            ))}
          </div>
        </article>

        <article className="card stack-lg">
          <div className="panel-heading">
            <div>
              <span className="subtle-label">Hiring analytics</span>
              <h2>Conversion funnel</h2>
            </div>
          </div>

          <div className="timeline-list">
            {data.funnel.map((stage) => (
              <article className="history-item" key={stage.label}>
                <div className="panel-heading">
                  <div>
                    <strong>{stage.label}</strong>
                    <p className="muted">{stage.value} candidates</p>
                  </div>
                  <span className="status-pill status-progress">
                    {Math.round((stage.value / funnelMax) * 100)}%
                  </span>
                </div>
              </article>
            ))}
          </div>
        </article>
      </section>

      <section className="card stack-lg">
        <div className="panel-heading">
          <div>
            <span className="subtle-label">Candidate pipeline</span>
            <h2>Recent candidates across all jobs</h2>
          </div>
          <Link className="button button-secondary" href="/dashboard/candidates">
            Open candidates
          </Link>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Latest job</th>
                <th>Resume Score</th>
                <th>Final AI Score</th>
                <th>Application Status</th>
              </tr>
            </thead>
            <tbody>
              {data.candidates.slice(0, 8).map((candidate) => (
                <tr key={candidate.id}>
                  <td>
                    <Link href={`/dashboard/candidates/${candidate.id}`}>{candidate.name}</Link>
                  </td>
                  <td>{candidate.latestJobTitle ?? "No role yet"}</td>
                  <td>{candidate.resumeScore ?? "NA"}</td>
                  <td>{candidate.candidateScore ?? "NA"}</td>
                  <td>{candidate.latestApplicationStatus ?? "No application"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
