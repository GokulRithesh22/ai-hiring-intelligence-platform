import { RecruiterLoginWireframe } from "@/components/wireframe/recruiter-login-form";

export default function RecruiterLoginPage() {
  return (
    <div className="wf-page">
      <div className="wf-container wf-centered">
        <div className="wf-card wf-stack-lg" style={{ width: "100%" }}>
          <div className="wf-logo">LOGO</div>
          <h1 className="wf-title">Recruiter Login</h1>
          <RecruiterLoginWireframe />
        </div>
      </div>
    </div>
  );
}
