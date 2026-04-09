import Link from "next/link";

export function TopNav() {
  return (
    <div className="landing-nav surface">
      <Link className="brand" href="/">
        <span className="brand-mark">AI</span>
        <span>Hiring Intelligence</span>
      </Link>
      <div className="landing-links">
        <Link className="button button-ghost" href="/dashboard">
          Recruiter Dashboard
        </Link>
        <Link className="button button-ghost" href="/jobs/growth-marketing-manager/apply">
          Candidate Portal
        </Link>
        <Link className="button button-primary" href="/login">
          Recruiter Login
        </Link>
      </div>
    </div>
  );
}
