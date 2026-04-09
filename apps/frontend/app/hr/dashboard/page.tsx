import { DashboardShell } from "@/components/layout/dashboard-shell";
import { HrDashboard } from "@/components/hr/hr-dashboard";
import { getHrDashboard } from "@/lib/api-adapters";

export default async function HrDashboardPage() {
  const data = await getHrDashboard({});

  return (
    <DashboardShell
      eyebrow="HR Command Center"
      title="Hiring operations dashboard"
      description="Track applicant throughput, monitor AI interview completion, and filter candidate pipelines across every active role."
    >
      <HrDashboard initialData={data} />
    </DashboardShell>
  );
}
