import Link from "next/link";

import { wireframeJdVariants } from "@/lib/wireframe-data";

type JdVariantsPageProps = {
  searchParams: Promise<{
    roleTitle?: string;
  }>;
};

export default async function JdVariantsPage({ searchParams }: JdVariantsPageProps) {
  const params = await searchParams;
  const pipelineTarget = "/job/associate-center-manager/pipeline";

  return (
    <div className="wf-page">
      <div className="wf-container wf-stack-lg">
        <div className="wf-section">
          <h1 className="wf-title">JD Variants</h1>
          {!params.roleTitle ? null : <p className="wf-text">Role Title: {params.roleTitle}</p>}
        </div>

        <section className="wf-list">
          {wireframeJdVariants.map((variant) => (
            <article className="wf-card wf-stack" key={variant.id}>
              <h2 className="wf-title" style={{ fontSize: 24 }}>
                {variant.title}
              </h2>
              <p className="wf-text">{variant.summary}</p>
              <div className="wf-actions">
                <Link className="wf-link-button" href={pipelineTarget}>
                  Select
                </Link>
                <Link className="wf-link-button" href="/create-job">
                  Edit
                </Link>
              </div>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}
