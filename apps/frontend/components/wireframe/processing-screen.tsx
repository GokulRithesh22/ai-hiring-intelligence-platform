"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

type ProcessingScreenProps = {
  status: "qualified" | "rejected";
  questions: string[];
  jobId: string;
  candidateId: string;
};

export function ProcessingScreen({
  status,
  questions,
  jobId,
  candidateId
}: ProcessingScreenProps) {
  const router = useRouter();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (status === "qualified") {
        const search = new URLSearchParams({
          jobId,
          candidateId,
          questions: encodeURIComponent(JSON.stringify(questions))
        });
        router.replace(`/interview?${search.toString()}`);
        return;
      }

      router.replace("/application-submitted");
    }, 1200);

    return () => {
      window.clearTimeout(timer);
    };
  }, [candidateId, jobId, questions, router, status]);

  return (
    <div className="wf-centered">
      <div className="wf-container wf-center-text">
        <h1 className="wf-title">Analyzing your application...</h1>
      </div>
    </div>
  );
}
