import { DashboardShell } from "@/components/layout/dashboard-shell";
import { JobIntakeStudio } from "@/components/manager/job-intake-studio";
import { getJobIntakeQuestions } from "@/lib/api-adapters";

export default async function CreateJobPage() {
  const questions = await getJobIntakeQuestions();

  return (
    <DashboardShell
      eyebrow="Manager Workspace"
      title="AI job creation studio"
      description="Start with a job title, let AI run the intake conversation, and hand HR a structured draft with compensation, constraints, and interview guidance."
    >
      <JobIntakeStudio questions={questions} />
    </DashboardShell>
  );
}
