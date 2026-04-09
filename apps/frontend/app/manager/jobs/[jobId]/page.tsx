import { redirect } from "next/navigation";

type LegacyManagerJobDetailPageProps = {
  params: Promise<{
    jobId: string;
  }>;
};

export default async function LegacyManagerJobDetailPage({
  params
}: LegacyManagerJobDetailPageProps) {
  const { jobId } = await params;
  redirect(`/dashboard/jobs/${jobId}`);
}
