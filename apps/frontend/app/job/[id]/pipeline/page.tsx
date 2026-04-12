import Link from "next/link";

import { getPipelineCandidates } from "@/lib/wireframe-data";

type PipelinePageProps = {
  params: Promise<{
    id: string;
  }>;
};

const stages = ["Applied", "Screening", "Interview", "Shortlisted"];

export default async function PipelinePage({ params }: PipelinePageProps) {
  await params;
  const candidates = getPipelineCandidates();

  return (
    <div className="wf-page">
      <div className="wf-container wf-stack-lg">
        <h1 className="wf-title">Pipeline View</h1>

        <section className="wf-stage-row">
          {stages.map((stage) => (
            <div className="wf-stage" key={stage}>
              {stage}
            </div>
          ))}
        </section>

        <section className="wf-list">
          {candidates.map((candidate) => (
            <article className="wf-card wf-stack" key={candidate.id}>
              <p className="wf-text">Name: {candidate.name}</p>
              <p className="wf-text">Score: {candidate.score}</p>
              <p className="wf-text">Status: {candidate.status}</p>
              <Link className="wf-link-button" href={`/candidates/${candidate.id}`}>
                View Profile
              </Link>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}
