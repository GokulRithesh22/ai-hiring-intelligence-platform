import Link from "next/link";

import { RecruiterShell } from "@/components/recruiter/recruiter-shell";
import { getRecruiterCandidates } from "@/lib/recruiter-api";
import { requireRecruiterSession } from "@/lib/recruiter-auth";

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

export default async function RecruiterCandidatesPage() {
  await requireRecruiterSession("/dashboard/candidates");
  const candidates = await getRecruiterCandidates();

  return (
    <RecruiterShell
      eyebrow="Recruiter Candidates"
      title="Candidate pipeline"
      description="Open candidate intelligence, compare resume and AI scores, and review application status across all jobs."
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
                <th>Application Status</th>
                <th>Resume Score</th>
                <th>Final AI Score</th>
                <th>Applied</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((candidate) => (
                <tr key={candidate.id}>
                  <td>
                    <Link href={`/dashboard/candidates/${candidate.id}`}>{candidate.name}</Link>
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
                  <td>{candidate.candidateScore ?? "NA"}</td>
                  <td>{formatDate(candidate.appliedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </RecruiterShell>
  );
}
