import { CandidateProfilePageContent } from "@/components/wireframe/candidate-profile-page";

type CandidatePageProps = {
  params: Promise<{
    candidateId: string;
  }>;
};

export default async function CandidatePage({ params }: CandidatePageProps) {
  const { candidateId } = await params;

  return <CandidateProfilePageContent candidateId={candidateId} />;
}
