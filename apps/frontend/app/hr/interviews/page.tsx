import Link from "next/link";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getProtectedHrCandidates } from "@/lib/hr-api";
import { requireHrSession } from "@/lib/hr-auth";

export default async function HrInterviewsPage() {
  await requireHrSession();
  const candidates = await getProtectedHrCandidates();
  const interviewCandidates = candidates.filter(
    (candidate) =>
      candidate.interviewScore !== null ||
      candidate.latestApplicationStatus === "INTERVIEW_PENDING" ||
      candidate.latestApplicationStatus === "INTERVIEW_COMPLETED" ||
      candidate.latestApplicationStatus === "SHORTLISTED"
  );

  return (
    <DashboardShell
      eyebrow="HR Interviews"
      title="Interview operations"
      description="Monitor candidates with active or completed AI interviews and jump into the corresponding intelligence views for evidence-based review."
    >
      <section className="table-panel card stack">
        <div className="panel-heading">
          <div>
            <span className="subtle-label">Interview list</span>
            <h2>Active and completed AI interviews</h2>
          </div>
          <span className="status-pill status-approved">{interviewCandidates.length} records</span>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Latest Job</th>
                <th>Status</th>
                <th>Interview Score</th>
              </tr>
            </thead>
            <tbody>
              {interviewCandidates.map((candidate) => (
                <tr key={candidate.id}>
                  <td>
                    <Link href={`/hr/candidates/${candidate.id}`}>{candidate.name}</Link>
                  </td>
                  <td>{candidate.latestJobTitle ?? "No role"}</td>
                  <td>
                    <span className="status-pill status-progress">
                      {candidate.latestApplicationStatus ?? "Unknown"}
                    </span>
                  </td>
                  <td>{candidate.interviewScore ?? "Pending"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </DashboardShell>
  );
}
