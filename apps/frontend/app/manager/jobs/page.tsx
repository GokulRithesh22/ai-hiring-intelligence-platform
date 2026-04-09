import { ManagerHiringDashboard } from "@/components/manager/manager-hiring-dashboard";
import { ManagerShell } from "@/components/manager/manager-shell";
import { getProtectedManagerDashboard } from "@/lib/manager-api";
import { requireManagerSession } from "@/lib/manager-auth";

export default async function ManagerJobsPage() {
  await requireManagerSession("/manager/jobs");
  const data = await getProtectedManagerDashboard();

  return (
    <ManagerShell
      eyebrow="Manager Job Board"
      title="Manage every active job description"
      description="Compare manager-owned JDs, review applicant volume and shortlist momentum, and open any pipeline to inspect candidate intelligence."
    >
      <ManagerHiringDashboard data={data} />
    </ManagerShell>
  );
}
