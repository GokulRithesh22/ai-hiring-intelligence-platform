import { redirect } from "next/navigation";

type LegacyManagerDashboardDetailPageProps = {
  params: Promise<{
    jobId: string;
  }>;
};

export default async function LegacyManagerDashboardDetailPage({
  params
}: LegacyManagerDashboardDetailPageProps) {
  const { jobId } = await params;
  redirect(`/dashboard/jobs/${jobId}`);
}
