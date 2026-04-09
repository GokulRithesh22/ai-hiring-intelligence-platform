import Link from "next/link";

import { ManagerShell } from "@/components/manager/manager-shell";
import { requireManagerSession } from "@/lib/manager-auth";

export default async function ManagerCandidatesPage() {
  await requireManagerSession("/manager/candidates");

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
            <Link className="button button-primary" href="/manager/dashboard">
              Open manager dashboard
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
      </div>
    </ManagerShell>
  );
}
