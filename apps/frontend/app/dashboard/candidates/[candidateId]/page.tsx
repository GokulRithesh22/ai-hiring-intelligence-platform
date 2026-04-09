import { CandidateIntelligencePage } from "@/components/candidate/candidate-intelligence-page";
import { RecruiterShell } from "@/components/recruiter/recruiter-shell";
import { getProtectedCandidateProfile } from "@/lib/candidate-profile-server";
import { requireRecruiterSession } from "@/lib/recruiter-auth";

type RecruiterCandidatePageProps = {
  params: Promise<{
    candidateId: string;
  }>;
};

export default async function RecruiterCandidatePage({ params }: RecruiterCandidatePageProps) {
  const { candidateId } = await params;
  await requireRecruiterSession(`/dashboard/candidates/${candidateId}`);
  const profile = await getProtectedCandidateProfile(candidateId);

  return (
    <RecruiterShell
      eyebrow="Recruiter Intelligence View"
      title={`${profile.name} intelligence report`}
      description="Review resume insights, interview transcript evidence, weighted AI scoring, and confidence before moving the candidate forward."
    >
      <CandidateIntelligencePage profile={profile} />
    </RecruiterShell>
  );
}
