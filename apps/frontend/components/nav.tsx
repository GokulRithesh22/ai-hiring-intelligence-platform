import Link from "next/link";

export function TopNav() {
  return (
    <div className="landing-nav surface">
      <Link className="brand" href="/">
        <span className="brand-mark">AI</span>
        <span>Hiring Intelligence</span>
      </Link>
      <div className="landing-links">
        <Link className="button button-ghost" href="/manager/jobs/create">
          Create Job
        </Link>
        <Link className="button button-ghost" href="/hr/dashboard">
          HR Dashboard
        </Link>
        <Link className="button button-ghost" href="/hr/jobs">
          HR Jobs
        </Link>
        <Link className="button button-ghost" href="/jobs/growth-marketing-manager/apply">
          Candidate Portal
        </Link>
        <Link className="button button-primary" href="/hr/candidates">
          HR Candidates
        </Link>
      </div>
    </div>
  );
}
