import Link from "next/link";

import type { HrDashboardView } from "@/lib/types";

type HrDashboardProps = {
  data: HrDashboardView;
};

export function HrDashboard({ data }: HrDashboardProps) {
  const funnelMax = Math.max(...data.funnel.map((stage) => stage.value), 1);

  return (
    <div className="stack-lg">
      <section className="stats-grid">
        {data.metrics.map((metric) => (
          <article className="card" key={metric.label}>
            <span className="subtle-label">{metric.label}</span>
            <span className="stat-value">{metric.value}</span>
            <span className="muted">Live HR control metric</span>
          </article>
        ))}
      </section>

      <section className="card stack-lg">
        <div className="panel-heading">
          <div>
            <span className="subtle-label">Hiring funnel</span>
            <h2>Pipeline conversion from application to shortlist</h2>
          </div>
          <Link className="button button-secondary" href="/hr/analytics">
            Open analytics
          </Link>
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
              <div
                style={{
                  width: `${Math.max(10, (stage.value / funnelMax) * 100)}%`,
                  height: 10,
                  borderRadius: 999,
                  background:
                    "linear-gradient(90deg, rgba(74,108,247,0.88), rgba(54,198,160,0.82))"
                }}
              />
            </article>
          ))}
        </div>
      </section>

      <section className="summary-grid">
        <Link className="summary-chip" href="/hr/jobs">
          <span className="subtle-label">Jobs</span>
          <strong>Open job management</strong>
          <span className="muted">Track roles, owners, and application volume</span>
        </Link>
        <Link className="summary-chip" href="/hr/candidates">
          <span className="subtle-label">Candidates</span>
          <strong>Review intelligence reports</strong>
          <span className="muted">Open persistent profiles with interview evidence</span>
        </Link>
        <Link className="summary-chip" href="/hr/interviews">
          <span className="subtle-label">Interviews</span>
          <strong>Monitor AI interview activity</strong>
          <span className="muted">Track completed and pending interview outcomes</span>
        </Link>
        <Link className="summary-chip" href="/hr/analytics">
          <span className="subtle-label">Analytics</span>
          <strong>See hiring performance</strong>
          <span className="muted">Applications, completion rate, and score averages</span>
        </Link>
      </section>
    </div>
  );
}
