import { ManagerHiringDashboard } from "@/components/manager/manager-hiring-dashboard";
import { ManagerShell } from "@/components/manager/manager-shell";
import { getProtectedManagerDashboard } from "@/lib/manager-api";
import { requireManagerSession } from "@/lib/manager-auth";

export default async function ManagerDashboardPage() {
  await requireManagerSession("/manager/dashboard");
  const data = await getProtectedManagerDashboard();

  return (
    <ManagerShell
      eyebrow="Manager Workspace"
      title="Hiring intelligence dashboard"
      description="Track every active job description, compare pipeline health, and jump directly into candidate intelligence by role."
    >
      <ManagerHiringDashboard data={data} />
    </ManagerShell>
  );
}
