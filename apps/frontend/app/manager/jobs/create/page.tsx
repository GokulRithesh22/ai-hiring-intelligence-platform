import { ManagerShell } from "@/components/manager/manager-shell";
import { JobIntakeStudio } from "@/components/manager/job-intake-studio";
import { getJobIntakeQuestions } from "@/lib/api-adapters";
import { requireManagerSession } from "@/lib/manager-auth";

export default async function CreateJobPage() {
  await requireManagerSession("/manager/jobs/create");
  const questions = await getJobIntakeQuestions();

  return (
    <ManagerShell
      eyebrow="Manager Workspace"
      title="AI job creation studio"
      description="Switch between conversational AI intake and structured input, compare three JD variations, and refine the draft before handing it to HR."
    >
      <JobIntakeStudio questions={questions} />
    </ManagerShell>
  );
}
