import { RecruiterDashboard } from "@/components/recruiter/recruiter-dashboard";
import { RecruiterShell } from "@/components/recruiter/recruiter-shell";
import { getRecruiterOverview } from "@/lib/recruiter-api";
import { requireRecruiterSession } from "@/lib/recruiter-auth";

type RecruiterDashboardPageProps = {
  searchParams?: Promise<{
    scope?: string;
  }>;
};

export default async function RecruiterDashboardPage({
  searchParams
}: RecruiterDashboardPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const scope = params?.scope === "mine" ? "mine" : "all";

  await requireRecruiterSession(`/dashboard${scope === "mine" ? "?scope=mine" : ""}`);
  const data = await getRecruiterOverview(scope);

  return (
    <RecruiterShell
      eyebrow="Recruiter Workspace"
      title="Unified hiring dashboard"
      description="Manage jobs, monitor the candidate pipeline, and track hiring analytics from one recruiter workspace."
    >
      <RecruiterDashboard data={data} />
    </RecruiterShell>
  );
}
