import { CreateJobForm } from "@/components/wireframe/create-job-form";

export default function CreateJobPage() {
  return (
    <div className="wf-page">
      <div className="wf-container">
        <div className="wf-card wf-stack-lg">
          <h1 className="wf-title">Create Job</h1>
          <CreateJobForm />
        </div>
      </div>
    </div>
  );
}
