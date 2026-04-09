import Link from "next/link";
import type { LandingContent } from "@/lib/types";

type LandingPageProps = {
  content: LandingContent;
  actions: React.ReactNode;
};

export function LandingPage({ content, actions }: LandingPageProps) {
  return (
    <div className="landing">
      <div className="page-shell">
        <nav className="landing-nav surface">
          <Link className="brand" href="/">
            <span className="brand-mark">AI</span>
            <span>Hiring Intelligence</span>
          </Link>

          <div className="landing-links">
            <Link className="button button-ghost" href="/manager/dashboard">
              Manager flow
            </Link>
            <Link className="button button-ghost" href="/hr/dashboard">
              HR dashboard
            </Link>
            <Link className="button button-primary" href="/jobs/growth-marketing-manager/apply">
              Candidate portal
            </Link>
          </div>
        </nav>

        <section className="hero-grid">
          <div className="hero-copy">
            <span className="pill">AI-native hiring workflow</span>
            <h1>Hire faster with persistent candidate intelligence.</h1>
            <p>
              Generate job descriptions through AI intake conversations, screen resumes
              automatically, run structured AI interviews, and equip managers with
              evidence-backed hiring reports that improve every interview loop.
            </p>

            <div className="hero-actions">{actions}</div>

            <div className="hero-metrics">
              {content.metrics.map((metric) => (
                <article className="hero-metric" key={metric.label}>
                  <span className="metric-value">{metric.value}</span>
                  <span className="metric-label">{metric.label}</span>
                </article>
              ))}
            </div>
          </div>

          <aside className="hero-panel surface stack-lg">
            <div className="panel-heading">
              <div>
                <span className="subtle-label">Live hiring intelligence</span>
                <h2>Decision-ready signal in one workspace</h2>
              </div>
              <span className="status-pill status-active">Platform active</span>
            </div>

            {content.showcase.map((item) => (
              <article className="card" key={item.title} style={{ padding: 22 }}>
                <div className="panel-heading">
                  <div>
                    <strong>{item.title}</strong>
                    <p className="muted">{item.subtitle}</p>
                  </div>
                  <span className={`status-pill ${item.statusClass}`}>{item.status}</span>
                </div>
                <p className="supporting-copy">{item.body}</p>
              </article>
            ))}
          </aside>
        </section>

        <section className="section">
          <div className="section-heading">
            <div className="section-copy">
              <span className="kicker">Core capabilities</span>
              <h2>Designed for high-signal hiring teams</h2>
            </div>
            <p className="supporting-copy">
              Each surface is built to hand off seamlessly between managers, HR, and
              candidates while preserving structured intelligence.
            </p>
          </div>

          <div className="feature-grid">
            {content.features.map((feature) => (
              <article key={feature.title}>
                <span className="subtle-label">{feature.eyebrow}</span>
                <h3>{feature.title}</h3>
                <p className="supporting-copy">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <div className="section-copy">
              <span className="kicker">Platform workflow</span>
              <h2>From AI intake to manager interview prep</h2>
            </div>
          </div>

          <div className="workflow-grid">
            {content.workflow.map((step, index) => (
              <article className="workflow-step" key={step.title}>
                <div className="workflow-index">0{index + 1}</div>
                <h3>{step.title}</h3>
                <p className="supporting-copy">{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <div className="section-copy">
              <span className="kicker">Operator views</span>
              <h2>Purpose-built surfaces across the funnel</h2>
            </div>
          </div>

          <div className="showcase-grid">
            {content.productViews.map((view) => (
              <article key={view.title}>
                <span className="subtle-label">{view.eyebrow}</span>
                <h3>{view.title}</h3>
                <p className="supporting-copy">{view.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="cta-strip">
          <div>
            <span className="kicker" style={{ color: "#fff" }}>
              Ready to launch
            </span>
            <h2 style={{ margin: "10px 0 0" }}>Open the end-to-end hiring frontend.</h2>
            <p>
              The app is structured for production with mock adapters that can switch to
              live APIs through environment configuration.
            </p>
          </div>
          <div className="landing-links">
            <Link className="button button-secondary" href="/candidates/cand-001">
              View candidate report
            </Link>
            <Link className="button button-secondary" href="/jobs/growth-marketing-manager/apply">
              Test application flow
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
