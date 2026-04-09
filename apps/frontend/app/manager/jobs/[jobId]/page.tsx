import Link from "next/link";

import { ManagerShell } from "@/components/manager/manager-shell";
import { ManagerJobIntelligence } from "@/components/manager/manager-job-intelligence";
import { getProtectedManagerJobIntelligence } from "@/lib/manager-api";
import { requireManagerSession } from "@/lib/manager-auth";

type ManagerJobDetailPageProps = {
  params: Promise<{
    jobId: string;
  }>;
};

export default async function ManagerJobDetailPage({ params }: ManagerJobDetailPageProps) {
  const { jobId } = await params;
  await requireManagerSession(`/manager/jobs/${jobId}`);
  const data = await getProtectedManagerJobIntelligence(jobId);

  return (
    <ManagerShell
      eyebrow="Manager Hiring Intelligence"
      title={`${data.job.title} candidate intelligence`}
      description="Open role-specific candidate intelligence, review AI signals, and move from job strategy to candidate evidence without leaving the manager workspace."
    >
      <div className="stack-lg">
        <section className="cta-strip" style={{ marginBottom: 0 }}>
          <div>
            <span className="subtle-label" style={{ color: "rgba(255,255,255,0.78)" }}>
              Active JD
            </span>
            <h2 style={{ margin: "8px 0 0" }}>{data.job.title}</h2>
            <p>{data.job.descriptionPreview}</p>
          </div>

          <Link className="button button-secondary" href="/manager/jobs">
            Back to job board
          </Link>
        </section>

        <ManagerJobIntelligence data={data} />
      </div>
    </ManagerShell>
  );
}
