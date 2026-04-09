import Link from "next/link";

import { ManagerJobIntelligence } from "@/components/manager/manager-job-intelligence";
import { RecruiterJobEditor } from "@/components/recruiter/recruiter-job-editor";
import { RecruiterShell } from "@/components/recruiter/recruiter-shell";
import { getRecruiterJob, getRecruiterJobIntelligence } from "@/lib/recruiter-api";
import { requireRecruiterSession } from "@/lib/recruiter-auth";

type RecruiterJobDetailPageProps = {
  params: Promise<{
    jobId: string;
  }>;
};

export default async function RecruiterJobDetailPage({ params }: RecruiterJobDetailPageProps) {
  const { jobId } = await params;
  await requireRecruiterSession(`/dashboard/jobs/${jobId}`);
  const [data, job] = await Promise.all([
    getRecruiterJobIntelligence(jobId),
    getRecruiterJob(jobId)
  ]);

  return (
    <RecruiterShell
      eyebrow="Recruiter Candidate Pipeline"
      title={`${data.job.title} pipeline view`}
      description="Review stage-by-stage candidate movement, open intelligence reports, and manage recruiter actions from one job pipeline view."
    >
      <div className="stack-lg">
        <section className="cta-strip" style={{ marginBottom: 0 }}>
          <div>
            <span className="subtle-label" style={{ color: "rgba(255,255,255,0.78)" }}>
              Active job
            </span>
            <h2 style={{ margin: "8px 0 0" }}>{data.job.title}</h2>
            <p>{data.job.descriptionPreview}</p>
          </div>

          <Link className="button button-secondary" href="/dashboard/jobs">
            Back to job board
          </Link>
        </section>

        <ManagerJobIntelligence data={data} />
        <RecruiterJobEditor
          job={{
            id: job.id,
            title: job.title,
            location: job.location,
            description: job.description,
            status: job.status
          }}
        />
      </div>
    </RecruiterShell>
  );
}
