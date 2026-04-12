import { CandidateProfilePageContent } from "@/components/wireframe/candidate-profile-page";

type CandidateProfilePageProps = {
  params: Promise<{
    candidateId: string;
  }>;
};

export default async function CandidateProfilePage({
  params
}: CandidateProfilePageProps) {
  const { candidateId } = await params;

  return <CandidateProfilePageContent candidateId={candidateId} />;
}
