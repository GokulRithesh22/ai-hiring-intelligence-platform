import Link from "next/link";

import { ManagerHiringDashboard } from "@/components/manager/manager-hiring-dashboard";
import { RecruiterShell } from "@/components/recruiter/recruiter-shell";
import { getRecruiterJobBoard } from "@/lib/recruiter-api";
import { requireRecruiterSession } from "@/lib/recruiter-auth";

type RecruiterJobsPageProps = {
  searchParams?: Promise<{
    scope?: string;
  }>;
};

export default async function RecruiterJobsPage({ searchParams }: RecruiterJobsPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const scope = params?.scope === "mine" ? "mine" : "all";

  await requireRecruiterSession(`/dashboard/jobs${scope === "mine" ? "?scope=mine" : ""}`);
  const data = await getRecruiterJobBoard(scope);

  return (
    <RecruiterShell
      eyebrow="Recruiter Jobs"
      title="Job management board"
      description="See all jobs, filter to jobs posted by you, and open any candidate pipeline for deeper review."
    >
      <div className="stack-lg">
        <section className="shell-actions">
          <Link
            className={`button ${scope === "all" ? "button-primary" : "button-secondary"}`}
            href="/dashboard/jobs"
          >
            All Jobs
          </Link>
          <Link
            className={`button ${scope === "mine" ? "button-primary" : "button-secondary"}`}
            href="/dashboard/jobs?scope=mine"
          >
            Jobs Posted By Me
          </Link>
        </section>

        <ManagerHiringDashboard data={data} />
      </div>
    </RecruiterShell>
  );
}
