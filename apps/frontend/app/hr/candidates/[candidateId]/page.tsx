import { redirect } from "next/navigation";

type LegacyHrCandidatePageProps = {
  params: Promise<{
    candidateId: string;
  }>;
};

export default async function LegacyHrCandidatePage({ params }: LegacyHrCandidatePageProps) {
  const { candidateId } = await params;
  redirect(`/dashboard/candidates/${candidateId}`);
}
