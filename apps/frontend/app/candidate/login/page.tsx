import { CandidateLoginForm } from "@/components/wireframe/candidate-login-form";

export default function CandidateLoginPage() {
  return (
    <div className="wf-page">
      <div className="wf-container wf-centered">
        <div className="wf-card wf-stack-lg" style={{ width: "100%" }}>
          <div className="wf-stack">
            <div className="wf-logo">LOGO</div>
            <h1 className="wf-title">Candidate Login</h1>
          </div>

          <CandidateLoginForm />
        </div>
      </div>
    </div>
  );
}
