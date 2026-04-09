import type { CandidateProfileData } from "@/lib/types";

type CandidateIntelligencePageProps = {
  profile: CandidateProfileData;
};

export function CandidateIntelligencePage({
  profile
}: CandidateIntelligencePageProps) {
  return (
    <div className="stack-lg">
      <section className="overview-panel card stack-lg">
        <div className="panel-heading">
          <div>
            <span className="subtle-label">Candidate overview</span>
            <h2>{profile.name}</h2>
            <p className="supporting-copy">{profile.overview}</p>
          </div>
          <span className={`status-pill ${profile.recommendation.statusClass}`}>
            {profile.recommendation.label}
          </span>
        </div>

        <div className="overview-grid">
          <article className="summary-chip">
            <span className="subtle-label">Current role</span>
            <strong>{profile.currentRole}</strong>
            <span className="muted">{profile.location}</span>
          </article>
          <article className="summary-chip">
            <span className="subtle-label">Resume match</span>
            <strong>{profile.resumeScore}</strong>
            <span className="muted">{profile.resumeSynopsis}</span>
          </article>
          <article className="summary-chip">
            <span className="subtle-label">Interview score</span>
            <strong>{profile.interviewScore}</strong>
            <span className="muted">{profile.interviewSummary}</span>
          </article>
          <article className="summary-chip">
            <span className="subtle-label">Application history</span>
            <strong>{profile.applicationHistory.length} roles tracked</strong>
            <span className="muted">Permanent candidate memory</span>
          </article>
        </div>
      </section>

      <section className="transcript-grid">
        <div className="transcript-panel card stack-lg">
          <div className="panel-heading">
            <div>
              <span className="subtle-label">Application history</span>
              <h2>Role movement and outcomes</h2>
            </div>
          </div>

          <div className="history-list">
            {profile.applicationHistory.map((application) => (
              <article className="history-item" key={`${application.jobTitle}-${application.date}`}>
                <div className="panel-heading">
                  <div>
                    <strong>{application.jobTitle}</strong>
                    <p className="muted">{application.date}</p>
                  </div>
                  <span className={`status-pill ${application.statusClass}`}>
                    {application.status}
                  </span>
                </div>
                <p className="muted">{application.notes}</p>
              </article>
            ))}
          </div>

          <div className="panel-heading">
            <div>
              <span className="subtle-label">AI interview transcript</span>
              <h2>Questions, answers, and scoring evidence</h2>
            </div>
          </div>

          <div className="timeline-list">
            {profile.interviewTranscript.map((item, index) => (
              <article className="transcript-entry" key={`${index}-${item.question}`}>
                <strong>Q{index + 1}. {item.question}</strong>
                <p>{item.answer}</p>
                <span className="muted">Evaluation score: {item.score}</span>
              </article>
            ))}
          </div>
        </div>

        <div className="stack-lg">
          <section className="overview-panel card stack-lg">
            <div className="panel-heading">
              <div>
                <span className="subtle-label">Resume and LinkedIn insights</span>
                <h2>Evidence extracted from the profile</h2>
              </div>
            </div>

            <div className="insight-grid">
              <article className="insight-item">
                <strong>Resume analysis</strong>
                <p className="muted">{profile.resumeInsights}</p>
              </article>
              <article className="insight-item">
                <strong>LinkedIn insights</strong>
                <p className="muted">{profile.linkedInInsights}</p>
              </article>
              <article className="insight-item">
                <strong>Claim verification</strong>
                <p className="muted">{profile.claimVerification}</p>
              </article>
              <article className="insight-item">
                <strong>Suggested manager questions</strong>
                <p className="muted">{profile.suggestedQuestions.join(" | ")}</p>
              </article>
            </div>
          </section>

          <section className="question-panel card stack-lg">
            <div className="panel-heading">
              <div>
                <span className="subtle-label">Interview scores</span>
                <h2>Communication, knowledge, and confidence</h2>
              </div>
            </div>

            <div className="score-grid">
              <article className="score-card">
                <strong>{profile.scoreBreakdown.communication}</strong>
                <span className="muted">Communication</span>
              </article>
              <article className="score-card">
                <strong>{profile.scoreBreakdown.knowledge}</strong>
                <span className="muted">Knowledge</span>
              </article>
              <article className="score-card">
                <strong>{profile.scoreBreakdown.confidence}</strong>
                <span className="muted">Confidence</span>
              </article>
              <article className="score-card">
                <strong>{profile.scoreBreakdown.overall}</strong>
                <span className="muted">Overall recommendation</span>
              </article>
            </div>
          </section>

          <section className="recommendation-panel stack-lg">
            <div>
              <span className="subtle-label" style={{ color: "rgba(255,255,255,0.82)" }}>
                AI hiring recommendation
              </span>
              <h2 style={{ margin: "10px 0 0" }}>{profile.recommendation.title}</h2>
              <p>{profile.recommendation.summary}</p>
            </div>

            <div className="highlight-list">
              {profile.recommendation.highlights.map((highlight) => (
                <div className="highlight-item" key={highlight}>
                  {highlight}
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
