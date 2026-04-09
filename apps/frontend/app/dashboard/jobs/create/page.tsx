import { JobIntakeStudio } from "@/components/manager/job-intake-studio";
import { RecruiterShell } from "@/components/recruiter/recruiter-shell";
import { requireRecruiterSession } from "@/lib/recruiter-auth";
import { jobIntakeQuestions } from "@/lib/mock-data";

export default async function RecruiterJobCreatePage() {
  await requireRecruiterSession("/dashboard/jobs/create");

  return (
    <RecruiterShell
      eyebrow="Recruiter Job Creation"
      title="Create a job description"
      description="Use the structured form, generate multiple JD variations, refine the best version, and publish the role to the candidate landing page."
    >
      <JobIntakeStudio questions={jobIntakeQuestions} />
    </RecruiterShell>
  );
}
