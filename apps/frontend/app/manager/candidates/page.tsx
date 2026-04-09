import Link from "next/link";

import { ManagerShell } from "@/components/manager/manager-shell";
import { getProtectedManagerDashboard } from "@/lib/manager-api";
import { requireManagerSession } from "@/lib/manager-auth";

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default async function ManagerCandidatesPage() {
  await requireManagerSession("/manager/candidates");
  const data = await getProtectedManagerDashboard();

  return (
    <ManagerShell
      eyebrow="Manager Candidate Intelligence"
      title="Candidate intelligence hub"
      description="Open role-specific candidate evidence from the manager dashboard. Each job card leads to a candidate intelligence view for that pipeline."
    >
      <div className="stack-lg">
        <section className="card stack-lg" style={{ padding: 28 }}>
          <div className="panel-heading">
            <div>
              <span className="subtle-label">Candidate intelligence entry point</span>
              <h2>Select a job description to review candidate evidence</h2>
              <p className="muted" style={{ marginBottom: 0 }}>
                Manager candidate views are scoped to the JD so you can inspect pipeline-specific
                applicants, interview signals, and scoring context without leaving the hiring flow.
              </p>
            </div>
          </div>

          <div className="shell-actions">
            <Link className="button button-primary" href="/manager/jobs">
              Open job board
            </Link>
            <Link className="button button-secondary" href="/manager/jobs/create">
              Create new JD
            </Link>
          </div>
        </section>

        <section className="stats-grid">
          <article className="card">
            <span className="subtle-label">Entry pattern</span>
            <span className="stat-value">JD first</span>
            <span className="muted">Pick a role, then inspect the candidates tied to it.</span>
          </article>
          <article className="card">
            <span className="subtle-label">Protected view</span>
            <span className="stat-value">Manager only</span>
            <span className="muted">Requires a manager or admin Supabase session.</span>
          </article>
          <article className="card">
            <span className="subtle-label">Evidence set</span>
            <span className="stat-value">Resume + interview</span>
            <span className="muted">Structured scoring, transcript evidence, and AI notes.</span>
          </article>
        </section>

        <section className="stack-lg">
          <div className="panel-heading">
            <div>
              <span className="subtle-label">Multi-JD routing</span>
              <h2>Open candidate intelligence by active job description</h2>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gap: 18,
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))"
            }}
          >
            {data.jobs.map((job) => (
              <article className="card stack" key={job.id} style={{ padding: 22 }}>
                <div className="panel-heading">
                  <div>
                    <span className="status-pill status-progress">{formatStatus(job.status)}</span>
                    <h3 style={{ margin: "12px 0 6px" }}>{job.title}</h3>
                    <p className="muted" style={{ margin: 0 }}>
                      {job.location}
                    </p>
                  </div>
                </div>

                <div className="summary-grid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
                  <article className="summary-chip">
                    <span className="subtle-label">Applicants</span>
                    <strong>{job.applicantsCount}</strong>
                  </article>
                  <article className="summary-chip">
                    <span className="subtle-label">Shortlisted</span>
                    <strong>{job.shortlistedCount}</strong>
                  </article>
                </div>

                <div className="summary-chip">
                  <span className="subtle-label">Pipeline distribution</span>
                  <span className="muted">
                    {job.pipelineDistribution
                      .filter((stage) => stage.count > 0)
                      .slice(0, 4)
                      .map((stage) => `${stage.label}: ${stage.count}`)
                      .join(" | ")}
                  </span>
                </div>

                <div className="shell-actions">
                  <Link className="button button-primary" href={`/manager/jobs/${job.id}`}>
                    Open pipeline
                  </Link>
                  <Link className="button button-secondary" href={`/manager/dashboard/${job.id}`}>
                    Dashboard entry
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </ManagerShell>
  );
}
