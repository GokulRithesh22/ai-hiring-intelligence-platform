import { CandidateIntelligencePage } from "@/components/candidate/candidate-intelligence-page";
import { ManagerShell } from "@/components/manager/manager-shell";
import { getCandidateProfile } from "@/lib/api-adapters";
import { requireManagerSession } from "@/lib/manager-auth";

type ManagerCandidatePageProps = {
  params: Promise<{
    candidateId: string;
  }>;
};

export default async function ManagerCandidatePage({ params }: ManagerCandidatePageProps) {
  const { candidateId } = await params;
  await requireManagerSession(`/manager/candidates/${candidateId}`);
  const profile = await getCandidateProfile(candidateId);

  return (
    <ManagerShell
      eyebrow="Manager Intelligence View"
      title={`${profile.name} intelligence report`}
      description="Review persistent candidate memory across applications, resume analysis, interview evidence, claim verification, and manager-ready follow-up prompts."
    >
      <CandidateIntelligencePage profile={profile} />
    </ManagerShell>
  );
}
