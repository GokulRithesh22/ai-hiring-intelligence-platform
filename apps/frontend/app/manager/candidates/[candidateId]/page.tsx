import { redirect } from "next/navigation";

type LegacyManagerCandidatePageProps = {
  params: Promise<{
    candidateId: string;
  }>;
};

export default async function LegacyManagerCandidatePage({
  params
}: LegacyManagerCandidatePageProps) {
  const { candidateId } = await params;
  redirect(`/dashboard/candidates/${candidateId}`);
}
