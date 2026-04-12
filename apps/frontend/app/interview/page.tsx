import Link from "next/link";

type InterviewIntroPageProps = {
  searchParams: Promise<{
    questions?: string;
  }>;
};

export default async function InterviewIntroPage({ searchParams }: InterviewIntroPageProps) {
  const params = await searchParams;
  const href = params.questions
    ? `/interview/session?questions=${params.questions}`
    : "/interview/session";

  return (
    <div className="wf-page">
      <div className="wf-container wf-centered">
        <div className="wf-card wf-stack-lg" style={{ width: "100%" }}>
          <h1 className="wf-title">AI Interview</h1>
          <p className="wf-text">This interview will be conducted by AI</p>
          <Link className="wf-link-button" href={href}>
            Start Interview
          </Link>
        </div>
      </div>
    </div>
  );
}
