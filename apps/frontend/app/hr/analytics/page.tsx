import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getProtectedHrAnalytics } from "@/lib/hr-api";
import { requireHrSession } from "@/lib/hr-auth";

export default async function HrAnalyticsPage() {
  await requireHrSession();
  const analytics = await getProtectedHrAnalytics();

  return (
    <DashboardShell
      eyebrow="HR Analytics"
      title="Hiring performance analytics"
      description="Track application demand, interview completion rate, and average resume and interview scores across the hiring portfolio."
    >
      <div className="stack-lg">
        <section className="stats-grid">
          <article className="card">
            <span className="subtle-label">Interview completion rate</span>
            <span className="stat-value">{analytics.interviewCompletionRate}%</span>
            <span className="muted">Completed sessions / total sessions</span>
          </article>
          <article className="card">
            <span className="subtle-label">Average resume score</span>
            <span className="stat-value">{analytics.averageResumeScore ?? "NA"}</span>
            <span className="muted">Across all applications</span>
          </article>
          <article className="card">
            <span className="subtle-label">Average interview score</span>
            <span className="stat-value">{analytics.averageInterviewScore ?? "NA"}</span>
            <span className="muted">Across scored interviews</span>
          </article>
        </section>

        <section className="table-panel card stack">
          <div className="panel-heading">
            <div>
              <span className="subtle-label">Applications per job</span>
              <h2>Role-level demand view</h2>
            </div>
          </div>

          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Job</th>
                  <th>Applications</th>
                </tr>
              </thead>
              <tbody>
                {analytics.applicationsPerJob.map((item) => (
                  <tr key={item.jobId}>
                    <td>{item.jobTitle}</td>
                    <td>{item.applicationsCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
