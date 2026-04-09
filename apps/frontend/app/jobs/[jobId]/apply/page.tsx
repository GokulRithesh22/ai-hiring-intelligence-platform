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
    <div className="landing">
      <div className="page-shell">
        <CandidateApplicationPortal portal={portal} />
      </div>
    </div>
  );
}
