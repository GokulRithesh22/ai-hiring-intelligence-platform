import { InterviewSession } from "@/components/wireframe/interview-session";

type InterviewSessionPageProps = {
  searchParams: Promise<{
    questions?: string;
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

export default async function InterviewSessionPage({
  searchParams
}: InterviewSessionPageProps) {
  const params = await searchParams;

  return (
    <div className="wf-page">
      <div className="wf-container wf-stack-lg">
        <h1 className="wf-title">AI Interview</h1>
        <InterviewSession questions={decodeQuestions(params.questions)} />
      </div>
    </div>
  );
}
