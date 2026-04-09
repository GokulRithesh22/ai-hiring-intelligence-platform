import Link from "next/link";
import type { PublicJobCard } from "@/lib/types";

type LandingPageProps = {
  jobs: PublicJobCard[];
};

export function LandingPage({ jobs }: LandingPageProps) {
  return (
    <div className="landing">
      <div className="page-shell">
        <nav className="landing-nav surface">
          <Link className="brand" href="/">
            <span className="brand-mark">AI</span>
            <span>Hiring Intelligence</span>
          </Link>

          <div className="landing-links">
            <Link className="button button-primary" href="/login">
              Login
            </Link>
          </div>
        </nav>

        <section className="jobs-hero surface">
          <div className="hero-copy">
            <span className="pill">Careers</span>
            <h1>Open roles at Hiring Intelligence</h1>
            <p>
              Explore the current roles across the organization. Hover over any role to
              preview the job description, then open the application flow.
            </p>
          </div>
        </section>

        <section className="section" id="open-roles">
          <div className="section-heading">
            <div className="section-copy">
              <span className="kicker">Open roles</span>
              <h2>Jobs in the organization</h2>
            </div>
          </div>

          <div className="job-board-grid">
            {jobs.map((job) => (
              <article className="job-board-card" key={job.id}>
                <div className="job-board-card-top">
                  <span className="subtle-label">{job.location}</span>
                  <span className="status-pill status-active">{job.experienceLevel}</span>
                </div>
                <h3>{job.title}</h3>
                <p className="supporting-copy job-board-preview">{job.summary}</p>
                <div className="job-board-overlay">
                  <p>{job.summary}</p>
                  <Link className="button button-primary" href={`/jobs/${job.slug}/apply`}>
                    View job
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
