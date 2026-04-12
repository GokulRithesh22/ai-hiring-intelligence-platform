import Link from "next/link";

import {
  getCandidateExperience,
  getCandidateWireframeProfile
} from "@/lib/wireframe-data";

type CandidateProfilePageContentProps = {
  candidateId: string;
};

export function CandidateProfilePageContent({
  candidateId
}: CandidateProfilePageContentProps) {
  const profile = getCandidateWireframeProfile(candidateId);
  const experience = getCandidateExperience(candidateId);

  return (
    <div className="wf-page">
      <div className="wf-container wf-stack-lg">
        <Link className="wf-link-button" href="/job/associate-center-manager/pipeline">
          Back
        </Link>

        <section className="wf-stack">
          <h1 className="wf-title">{profile.name}</h1>
          <p className="wf-text">Experience: {experience}</p>
        </section>

        <section className="wf-grid wf-grid-3">
          <div className="wf-card wf-stack">
            <p className="wf-meta">Resume Score</p>
            <p className="wf-text">{profile.resumeScore}</p>
          </div>
          <div className="wf-card wf-stack">
            <p className="wf-meta">Final Score</p>
            <p className="wf-text">{profile.scoreEngine.finalScore}</p>
          </div>
          <div className="wf-card wf-stack">
            <p className="wf-meta">Confidence</p>
            <p className="wf-text">{profile.scoreEngine.confidence}</p>
          </div>
        </section>

        <section className="wf-card wf-section">
          <h2 className="wf-title" style={{ fontSize: 24 }}>
            Score Breakdown
          </h2>
          <p className="wf-text">Communication: {profile.scoreBreakdown.communication}</p>
          <p className="wf-text">Knowledge: {profile.scoreBreakdown.knowledge}</p>
          <p className="wf-text">Confidence: {profile.scoreBreakdown.confidence}</p>
          <p className="wf-text">Overall: {profile.scoreBreakdown.overall}</p>
        </section>

        <section className="wf-card wf-section">
          <h2 className="wf-title" style={{ fontSize: 24 }}>
            Interview Insights
          </h2>
          <p className="wf-text">{profile.interviewSummary}</p>
          {profile.recommendation.highlights.map((highlight) => (
            <p className="wf-text" key={highlight}>
              {highlight}
            </p>
          ))}
        </section>

        <div className="wf-actions">
          <button className="wf-button" type="button">
            Shortlist
          </button>
          <button className="wf-button" type="button">
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}
