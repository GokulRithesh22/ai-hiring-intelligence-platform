import Link from "next/link";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getProtectedHrJobs } from "@/lib/hr-api";
import { requireHrSession } from "@/lib/hr-auth";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

export default async function HrJobsPage() {
  await requireHrSession();
  const jobs = await getProtectedHrJobs();

  return (
    <DashboardShell
      eyebrow="HR Job Management"
      title="Job control center"
      description="Review every role with ownership, application volume, publishing status, and drill-down access to the live candidate pipeline."
    >
      <section className="table-panel card stack">
        <div className="panel-heading">
          <div>
            <span className="subtle-label">Jobs table</span>
            <h2>All hiring requests</h2>
          </div>
          <span className="status-pill status-approved">{jobs.length} roles</span>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Job title</th>
                <th>Posted by</th>
                <th>Location</th>
                <th>Applications</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td>
                    <Link href={`/hr/jobs/${job.id}`}>{job.title}</Link>
                  </td>
                  <td>{job.postedBy}</td>
                  <td>{job.location ?? "Not set"}</td>
                  <td>{job.applicationsCount}</td>
                  <td>
                    <span className="status-pill status-progress">{job.status}</span>
                  </td>
                  <td>{formatDate(job.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </DashboardShell>
  );
}
