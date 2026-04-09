import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CandidateIntelligencePage } from "@/components/candidate/candidate-intelligence-page";
import { getCandidateProfile } from "@/lib/api-adapters";

type CandidatePageProps = {
  params: {
    candidateId: string;
  };
};

export default async function CandidatePage({ params }: CandidatePageProps) {
  const { candidateId } = params;
  const profile = await getCandidateProfile(candidateId);

  return (
    <DashboardShell
      eyebrow="Manager Intelligence View"
      title={`${profile.name} intelligence report`}
      description="Persistent candidate memory across applications, resume analysis, interview evidence, claim verification, and manager-ready follow-up prompts."
    >
      <CandidateIntelligencePage profile={profile} />
    </DashboardShell>
  );
}
