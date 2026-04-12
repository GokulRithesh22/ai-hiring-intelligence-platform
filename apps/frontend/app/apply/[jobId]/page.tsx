import { ApplicationForm } from "@/components/wireframe/application-form";

type ApplyPageProps = {
  params: Promise<{
    jobId: string;
  }>;
};

export default async function ApplyPage({ params }: ApplyPageProps) {
  const { jobId } = await params;

  return (
    <div className="wf-page">
      <div className="wf-container">
        <div className="wf-card wf-stack-lg">
          <h1 className="wf-title">Application Form</h1>
          <ApplicationForm jobId={jobId} />
        </div>
      </div>
    </div>
  );
}
