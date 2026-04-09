import { DashboardShell } from "@/components/layout/dashboard-shell";
import { HrDashboard } from "@/components/hr/hr-dashboard";
import { getProtectedHrDashboard } from "@/lib/hr-api";
import { requireHrSession } from "@/lib/hr-auth";

export default async function HrDashboardPage() {
  await requireHrSession("/hr/dashboard");
  const data = await getProtectedHrDashboard();

  return (
    <DashboardShell
      eyebrow="HR Command Center"
      title="Hiring operations dashboard"
      description="Track open positions, application flow, interview completion, and shortlisted talent from one protected HR workspace."
    >
      <HrDashboard data={data} />
    </DashboardShell>
  );
}
