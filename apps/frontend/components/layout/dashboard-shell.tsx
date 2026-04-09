"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  {
    href: "/",
    label: "Platform Overview",
    description: "Landing page and product narrative"
  },
  {
    href: "/manager/jobs/create",
    label: "Manager Job Flow",
    description: "AI intake and JD generation"
  },
  {
    href: "/hr/dashboard",
    label: "HR Dashboard",
    description: "Operations, filters, and approvals"
  },
  {
    href: "/jobs/growth-marketing-manager/apply",
    label: "Candidate Portal",
    description: "Application, screening, interview"
  },
  {
    href: "/candidates/cand-001",
    label: "Candidate Intelligence",
    description: "Permanent talent memory"
  }
];

type DashboardShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
};

export function DashboardShell({
  eyebrow,
  title,
  description,
  children
}: DashboardShellProps) {
  const pathname = usePathname();

  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <Link className="brand" href="/">
          <span className="brand-mark">AI</span>
          <span>Hiring Intelligence</span>
        </Link>

        <div className="sidebar-group">
          {navigation.map((item) => {
            const isActive = pathname === item.href;

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
            <Link className="button button-secondary" href="/manager/jobs/create">
              New job request
            </Link>
            <Link className="button button-primary" href="/hr/dashboard">
              Review pipeline
            </Link>
          </div>
        </header>

        <main className="shell-main">{children}</main>
      </div>
    </div>
  );
}
