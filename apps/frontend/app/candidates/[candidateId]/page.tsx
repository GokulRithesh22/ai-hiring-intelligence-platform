import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CandidateIntelligencePage } from "@/components/candidate/candidate-intelligence-page";
import { getProtectedCandidateProfile } from "@/lib/candidate-profile-server";

type CandidatePageProps = {
  params: Promise<{
    candidateId: string;
  }>;
};

export default async function CandidatePage({ params }: CandidatePageProps) {
  const { candidateId } = await params;
  const profile = await getProtectedCandidateProfile(candidateId);

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
