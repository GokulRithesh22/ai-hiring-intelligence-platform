"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navigation = [
  {
    href: "/manager/dashboard",
    label: "Dashboard",
    description: "Active pipelines and JD health"
  },
  {
    href: "/manager/jobs",
    label: "Job descriptions",
    description: "All manager-owned hiring pipelines"
  },
  {
    href: "/manager/jobs/create",
    label: "Create JD",
    description: "Conversational and structured intake"
  },
  {
    href: "/manager/candidates",
    label: "Candidates",
    description: "Candidate intelligence and history"
  }
];

type ManagerShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
};

export function ManagerShell({
  eyebrow,
  title,
  description,
  children
}: ManagerShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/manager/auth/logout", {
      method: "POST"
    });

    router.push("/manager/login");
    router.refresh();
  };

  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <Link className="brand" href="/manager/dashboard">
          <span className="brand-mark">AI</span>
          <span>Hiring Intelligence</span>
        </Link>

        <div className="sidebar-group">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href === "/manager/jobs" && pathname.startsWith("/manager/jobs/")) ||
              (item.href === "/manager/dashboard" && pathname.startsWith("/manager/dashboard/")) ||
              (item.href === "/manager/candidates" && pathname.startsWith("/manager/candidates/"));

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
              Create New Job Description
            </Link>
            <Link className="button button-primary" href="/manager/jobs">
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
