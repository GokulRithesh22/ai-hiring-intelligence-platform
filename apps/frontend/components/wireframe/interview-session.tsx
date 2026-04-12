"use client";

import { useEffect, useState } from "react";

type InterviewSessionProps = {
  questions: string[];
};

type TranscriptItem = {
  id: number;
  question: string;
  answer: string;
};

const fallbackQuestions = [
  "Tell us about your most relevant experience.",
  "How do you approach problem solving in this role?",
  "Why are you interested in this opportunity?"
];

export function InterviewSession({ questions }: InterviewSessionProps) {
  const queue = questions.length ? questions : fallbackQuestions;
  const [step, setStep] = useState(0);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);

  useEffect(() => {
    if (step >= queue.length) {
      return;
    }

    setListening(false);
    const listenTimer = window.setTimeout(() => {
      setListening(true);
    }, 900);

    const answerTimer = window.setTimeout(() => {
      setTranscript((current) => [
        ...current,
        {
          id: step,
          question: queue[step],
          answer: "Candidate response captured."
        }
      ]);
      setListening(false);
      setStep((current) => current + 1);
    }, 2600);

    return () => {
      window.clearTimeout(listenTimer);
      window.clearTimeout(answerTimer);
    };
  }, [queue, step]);

  const activeQuestion =
    step < queue.length ? queue[step] : "Interview complete. Thank you for your responses.";

  return (
    <div className="wf-interview-layout">
      <div className="wf-card wf-stack-lg">
        <div className="wf-section">
          <p className="wf-meta">AI message area</p>
          <h2 className="wf-title" style={{ fontSize: 24 }}>
            {activeQuestion}
          </h2>
        </div>

        <div className="wf-card">
          <p className="wf-meta">Listening indicator</p>
          <p className="wf-text">{listening ? "Listening..." : "Waiting for next response..."}</p>
        </div>
      </div>

      <aside className="wf-card wf-stack">
        <p className="wf-meta">Transcript</p>
        <div className="wf-transcript">
          {transcript.map((item) => (
            <div className="wf-card" key={item.id}>
              <p className="wf-text">
                <strong>AI:</strong> {item.question}
              </p>
              <p className="wf-text">
                <strong>Candidate:</strong> {item.answer}
              </p>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
