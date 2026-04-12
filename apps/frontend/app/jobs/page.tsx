import Link from "next/link";

import { getWireframeJobs } from "@/lib/wireframe-data";

export default function JobsPage() {
  const jobs = getWireframeJobs();

  return (
    <div className="wf-page">
      <div className="wf-container wf-stack-lg">
        <header className="wf-header">
          <div className="wf-logo">LOGO</div>
          <div className="wf-card">Profile</div>
        </header>

        <section className="wf-section">
          <h1 className="wf-title">Available Jobs</h1>
        </section>

        <section className="wf-list">
          {jobs.slice(0, 5).map((job) => (
            <article className="wf-card wf-stack" key={job.id}>
              <div className="wf-section">
                <h2 className="wf-title" style={{ fontSize: 24 }}>
                  {job.title}
                </h2>
                <p className="wf-meta">
                  {job.location} + {job.experienceLevel}
                </p>
                <p className="wf-text">{job.summary}</p>
              </div>

              <Link className="wf-link-button" href={`/jobs/${job.slug}`}>
                View Job
              </Link>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}
