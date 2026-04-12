import Link from "next/link";

import { getRecruiterDashboardJobs } from "@/lib/wireframe-data";

export default function DashboardPage() {
  const jobs = getRecruiterDashboardJobs();

  return (
    <div className="wf-page">
      <div className="wf-container wf-stack-lg">
        <header className="wf-header">
          <div className="wf-logo">LOGO</div>
          <div className="wf-card">Profile</div>
        </header>

        <div className="wf-actions">
          <Link className="wf-link-button" href="/create-job">
            + Create Job
          </Link>
        </div>

        <section className="wf-list">
          {jobs.map((job) => (
            <article className="wf-card wf-stack" key={job.id}>
              <div className="wf-section">
                <h2 className="wf-title" style={{ fontSize: 24 }}>
                  {job.title}
                </h2>
                <p className="wf-text">Applicants count: {job.applicants}</p>
                <p className="wf-text">Interview count: {job.interviews}</p>
                <p className="wf-text">Shortlisted count: {job.shortlisted}</p>
              </div>

              <Link className="wf-link-button" href={`/job/${job.id}/pipeline`}>
                View Pipeline
              </Link>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}
