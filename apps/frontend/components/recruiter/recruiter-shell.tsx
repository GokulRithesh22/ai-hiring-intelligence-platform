"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navigation = [
  {
    href: "/dashboard",
    label: "Dashboard",
    description: "Job management, pipeline, and analytics"
  },
  {
    href: "/dashboard/jobs",
    label: "Jobs",
    description: "All jobs and recruiter ownership filter"
  },
  {
    href: "/dashboard/jobs/create",
    label: "Create Job",
    description: "Structured JD generation and publish flow"
  },
  {
    href: "/dashboard/candidates",
    label: "Candidates",
    description: "Pipeline cards and intelligence reports"
  }
];

type RecruiterShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
};

export function RecruiterShell({
  eyebrow,
  title,
  description,
  children
}: RecruiterShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/recruiter/auth/logout", {
      method: "POST"
    });

    router.push("/login");
    router.refresh();
  };

  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <Link className="brand" href="/dashboard">
          <span className="brand-mark">AI</span>
          <span>Hiring Intelligence</span>
        </Link>

        <div className="sidebar-group">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href === "/dashboard/jobs" && pathname.startsWith("/dashboard/jobs/")) ||
              (item.href === "/dashboard/candidates" && pathname.startsWith("/dashboard/candidates/"));

            return (
              <Link
                key={item.href}
                className={`sidebar-link ${isActive ? "sidebar-link-active" : ""}`}
                href={item.href}
              >
                <strong>{item.label}</strong>
                <span>{item.description}</span>
              </Link>
            );
          })}
        </div>
      </aside>

      <div className="shell-content">
        <header className="shell-header">
          <div>
            <span className="kicker">{eyebrow}</span>
            <h1>{title}</h1>
            <p className="supporting-copy">{description}</p>
          </div>

          <div className="shell-actions">
            <Link className="button button-secondary" href="/dashboard/jobs/create">
              Create Job
            </Link>
            <Link className="button button-primary" href="/dashboard/jobs">
              Open Job Board
            </Link>
            <button className="button button-secondary" type="button" onClick={handleLogout}>
              Sign out
            </button>
          </div>
        </header>

        <main className="shell-main">{children}</main>
      </div>
    </div>
  );
}
