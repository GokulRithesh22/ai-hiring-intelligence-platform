import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CandidateApplicationPortal } from "@/components/candidate/candidate-application-portal";
import { getApplicationPortal } from "@/lib/api-adapters";

type ApplyPageProps = {
  params: Promise<{
    jobId: string;
  }>;
};

export default async function ApplyPage({ params }: ApplyPageProps) {
  const { jobId } = await params;
  const portal = await getApplicationPortal(jobId);

  return (
    <DashboardShell
      eyebrow="Candidate Experience"
      title={portal.job.title}
      description="Resume upload, qualification screening, and AI interview progression live on a single branded application surface."
    >
      <CandidateApplicationPortal portal={portal} />
    </DashboardShell>
  );
}
