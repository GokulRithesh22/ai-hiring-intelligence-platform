import { redirect } from "next/navigation";

type LegacyHrJobDetailPageProps = {
  params: Promise<{
    jobId: string;
  }>;
};

export default async function LegacyHrJobDetailPage({ params }: LegacyHrJobDetailPageProps) {
  const { jobId } = await params;
  redirect(`/dashboard/jobs/${jobId}`);
}
