import Link from "next/link";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getProtectedHrCandidates } from "@/lib/hr-api";
import { requireHrSession } from "@/lib/hr-auth";

function formatDate(value: string | null) {
  if (!value) {
    return "No applications yet";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

export default async function HrCandidatesPage() {
  await requireHrSession();
  const candidates = await getProtectedHrCandidates();

  return (
    <DashboardShell
      eyebrow="HR Candidates"
      title="Candidate intelligence list"
      description="Review every candidate with latest job, application status, resume score, and interview signal before opening the full intelligence profile."
    >
      <section className="table-panel card stack">
        <div className="panel-heading">
          <div>
            <span className="subtle-label">Candidate table</span>
            <h2>All candidates</h2>
          </div>
          <span className="status-pill status-approved">{candidates.length} candidates</span>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Current Company</th>
                <th>Latest Job</th>
                <th>Status</th>
                <th>Resume Score</th>
                <th>Interview Score</th>
                <th>Applied</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((candidate) => (
                <tr key={candidate.id}>
                  <td>
                    <Link href={`/hr/candidates/${candidate.id}`}>{candidate.name}</Link>
                  </td>
                  <td>{candidate.email}</td>
                  <td>{candidate.currentCompany ?? "Unknown"}</td>
                  <td>{candidate.latestJobTitle ?? "No role yet"}</td>
                  <td>
                    <span className="status-pill status-progress">
                      {candidate.latestApplicationStatus ?? "No application"}
                    </span>
                  </td>
                  <td>{candidate.resumeScore ?? "NA"}</td>
                  <td>{candidate.interviewScore ?? "NA"}</td>
                  <td>{formatDate(candidate.appliedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </DashboardShell>
  );
}
