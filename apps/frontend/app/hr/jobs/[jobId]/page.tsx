import Link from "next/link";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getProtectedHrJob } from "@/lib/hr-api";
import { requireHrSession } from "@/lib/hr-auth";

type HrJobDetailPageProps = {
  params: Promise<{
    jobId: string;
  }>;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

export default async function HrJobDetailPage({ params }: HrJobDetailPageProps) {
  const { jobId } = await params;
  await requireHrSession(`/hr/jobs/${jobId}`);
  const job = await getProtectedHrJob(jobId);

  return (
    <DashboardShell
      eyebrow="HR Job Detail"
      title={job.title}
      description="Inspect the approved job description, owner, pipeline health, and candidate list from a single protected HR detail view."
    >
      <section className="overview-panel card stack-lg">
        <div className="panel-heading">
          <div>
            <span className="subtle-label">Job description</span>
            <h2>Role brief and ownership</h2>
          </div>
          <span className="status-pill status-progress">{job.status}</span>
        </div>

        <div className="summary-grid">
          <article className="summary-chip">
            <span className="subtle-label">Hiring manager</span>
            <strong>{job.hiringManager?.fullName ?? "Unknown"}</strong>
            <span className="muted">{job.hiringManager?.email ?? "No email on file"}</span>
          </article>
          <article className="summary-chip">
            <span className="subtle-label">Location</span>
            <strong>{job.location ?? "Not set"}</strong>
            <span className="muted">Working model and geography</span>
          </article>
          <article className="summary-chip">
            <span className="subtle-label">Created</span>
            <strong>{formatDate(job.createdAt)}</strong>
            <span className="muted">Role intake created</span>
          </article>
          <article className="summary-chip">
            <span className="subtle-label">Candidates</span>
            <strong>{job.candidates.length}</strong>
            <span className="muted">Applications in pipeline</span>
          </article>
        </div>

        <article className="insight-item">
          <strong>Job description</strong>
          <p className="muted" style={{ whiteSpace: "pre-wrap" }}>
            {job.description}
          </p>
        </article>
      </section>

      <section className="card stack-lg">
        <div className="panel-heading">
          <div>
            <span className="subtle-label">Candidate pipeline</span>
            <h2>Role-specific hiring funnel</h2>
          </div>
        </div>

        <div className="summary-grid">
          {job.candidatePipeline.map((stage) => (
            <article className="summary-chip" key={stage.label}>
              <span className="subtle-label">{stage.label}</span>
              <strong>{stage.value}</strong>
              <span className="muted">Candidates</span>
            </article>
          ))}
        </div>
      </section>

      <section className="table-panel card stack">
        <div className="panel-heading">
          <div>
            <span className="subtle-label">Candidate list</span>
            <h2>Applications for this role</h2>
          </div>
          <Link className="button button-secondary" href="/hr/candidates">
            Open all candidates
          </Link>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Resume Score</th>
                <th>Interview Score</th>
                <th>Joining Timeline</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {job.candidates.map((candidate) => (
                <tr key={candidate.applicationId}>
                  <td>
                    <Link href={`/hr/candidates/${candidate.candidateId}`}>
                      {candidate.candidateName}
                    </Link>
                  </td>
                  <td>{candidate.resumeScore ?? "NA"}</td>
                  <td>{candidate.interviewScore ?? "NA"}</td>
                  <td>{candidate.joiningTimeline ?? "Unknown"}</td>
                  <td>
                    <span className="status-pill status-progress">{candidate.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </DashboardShell>
  );
}
