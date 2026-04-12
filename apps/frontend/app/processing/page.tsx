import { ProcessingScreen } from "@/components/wireframe/processing-screen";

type ProcessingPageProps = {
  searchParams: Promise<{
    status?: "qualified" | "rejected";
    questions?: string;
    jobId?: string;
    candidateId?: string;
  }>;
};

function decodeQuestions(value?: string) {
  if (!value) {
    return [];
  }

  try {
    return JSON.parse(decodeURIComponent(value)) as string[];
  } catch {
    return [];
  }
}

export default async function ProcessingPage({ searchParams }: ProcessingPageProps) {
  const params = await searchParams;

  return (
    <ProcessingScreen
      status={params.status === "rejected" ? "rejected" : "qualified"}
      questions={decodeQuestions(params.questions)}
      jobId={params.jobId ?? ""}
      candidateId={params.candidateId ?? ""}
    />
  );
}
