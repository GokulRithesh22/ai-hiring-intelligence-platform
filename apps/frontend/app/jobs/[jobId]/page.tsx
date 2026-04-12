import Link from "next/link";

import { getWireframeJob } from "@/lib/wireframe-data";

type JobDetailPageProps = {
  params: Promise<{
    jobId: string;
  }>;
};

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { jobId } = await params;
  const detail = getWireframeJob(jobId);

  return (
    <div className="wf-page">
      <div className="wf-container wf-stack-lg">
        <Link className="wf-link-button" href="/jobs">
          Back
        </Link>

        <section className="wf-stack">
          <h1 className="wf-title">{detail.job.title}</h1>
          <p className="wf-meta">{detail.job.location}</p>
          <p className="wf-meta">{detail.job.experienceLevel}</p>
        </section>

        <section className="wf-card wf-section">
          <h2 className="wf-title" style={{ fontSize: 24 }}>
            Role Summary
          </h2>
          <p className="wf-text">{detail.job.summary}</p>
        </section>

        <section className="wf-card wf-section">
          <h2 className="wf-title" style={{ fontSize: 24 }}>
            Responsibilities
          </h2>
          {detail.responsibilities.map((item) => (
            <p className="wf-text" key={item}>
              {item}
            </p>
          ))}
        </section>

        <section className="wf-card wf-section">
          <h2 className="wf-title" style={{ fontSize: 24 }}>
            Skills
          </h2>
          {detail.skills.map((item) => (
            <p className="wf-text" key={item}>
              {item}
            </p>
          ))}
        </section>

        <Link className="wf-link-button" href={`/apply/${detail.job.slug}`}>
          Apply
        </Link>
      </div>
    </div>
  );
}
