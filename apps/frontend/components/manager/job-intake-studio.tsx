"use client";

import { useState, useTransition } from "react";
import { generateJobDescription } from "@/lib/api-adapters";
import type { GeneratedJobDescription, JobIntakeQuestion } from "@/lib/types";

type JobIntakeStudioProps = {
  questions: JobIntakeQuestion[];
};

export function JobIntakeStudio({ questions }: JobIntakeStudioProps) {
  const [jobTitle, setJobTitle] = useState("Growth Marketing Manager");
  const [draftJobTitle, setDraftJobTitle] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [draft, setDraft] = useState<GeneratedJobDescription | null>(null);
  const [isPending, startTransition] = useTransition();

  const conversation: Array<{ role: "ai" | "user"; text: string }> = [];

  if (draftJobTitle) {
    questions.forEach((question, index) => {
      if (index <= activeIndex) {
        conversation.push({ role: "ai", text: question.prompt });
      }

      const answer = answers[question.id];

      if (answer) {
        conversation.push({ role: "user", text: answer });
      }
    });
  }

  const progress = Math.min(
    100,
    Math.round((Object.keys(answers).length / questions.length) * 100)
  );

  const handleStart = () => {
    const normalizedTitle = jobTitle.trim();

    if (!normalizedTitle) {
      return;
    }

    setDraftJobTitle(normalizedTitle);
    setActiveIndex(0);
    setCurrentAnswer("");
    setAnswers({});
    setDraft(null);
  };

  const handleSubmitAnswer = () => {
    const question = questions[activeIndex];
    const normalizedAnswer = currentAnswer.trim();

    if (!question || !normalizedAnswer) {
      return;
    }

    const nextAnswers = {
      ...answers,
      [question.id]: normalizedAnswer
    };

    setAnswers(nextAnswers);
    setCurrentAnswer("");

    if (activeIndex < questions.length - 1) {
      setActiveIndex((current) => current + 1);
      return;
    }

    startTransition(async () => {
      const generated = await generateJobDescription({
        jobTitle: draftJobTitle,
        answers: nextAnswers
      });
      setDraft(generated);
    });
  };

  return (
    <div className="manager-layout">
      <section className="form-section card stack-lg">
        <div className="panel-heading">
          <div>
            <span className="subtle-label">AI intake conversation</span>
            <h2>Start with the role title</h2>
          </div>
          <span className="status-pill status-progress">{progress}% complete</span>
        </div>

        <div className="field-grid">
          <label className="field">
            <span>Job title</span>
            <input
              value={jobTitle}
              onChange={(event) => setJobTitle(event.target.value)}
              placeholder="Growth Marketing Manager"
            />
          </label>
          <div className="field" style={{ justifyContent: "end" }}>
            <span>Conversation control</span>
            <button className="button button-primary" type="button" onClick={handleStart}>
              Begin AI intake
            </button>
          </div>
        </div>

        <div className="chat-feed">
          {!draftJobTitle ? (
            <div className="empty-state">
              Enter the role title to begin the structured intake flow.
            </div>
          ) : (
            conversation.map((entry, index) => (
              <div
                className={`chat-bubble ${
                  entry.role === "ai" ? "chat-bubble-ai" : "chat-bubble-user"
                }`}
                key={`${entry.role}-${index}`}
              >
                {entry.text}
              </div>
            ))
          )}
        </div>

        <div className="field">
          <span>{questions[activeIndex]?.label ?? "AI job description generated"}</span>
          <textarea
            disabled={isPending || !questions[activeIndex]}
            rows={4}
            value={currentAnswer}
            onChange={(event) => setCurrentAnswer(event.target.value)}
            placeholder={
              questions[activeIndex]?.placeholder ??
              "The AI intake is complete. Review the generated job description."
            }
          />
        </div>

        <div className="shell-actions">
          <button
            className="button button-primary"
            type="button"
            onClick={handleSubmitAnswer}
            disabled={isPending || !questions[activeIndex]}
          >
            {activeIndex < questions.length - 1 ? "Send answer" : "Generate job description"}
          </button>
          <span className="muted">
            AI asks about role problem, skills, seniority, compensation, joining window, and
            relocation constraints.
          </span>
        </div>
      </section>

      <aside className="form-section card stack-lg">
        <div className="panel-heading">
          <div>
            <span className="subtle-label">Structured output</span>
            <h2>Draft job description</h2>
          </div>
          <span className={`status-pill ${draft ? "status-approved" : "status-pending"}`}>
            {draft ? "Ready for HR" : "Waiting on AI"}
          </span>
        </div>

        {!draft ? (
          <div className="empty-state">
            Complete the intake conversation to generate the job description, interview
            focus areas, and approval summary.
          </div>
        ) : (
          <div className="stack-lg">
            <div className="summary-grid">
              <article>
                <span className="subtle-label">Role</span>
                <strong>{draft.title}</strong>
                <span className="muted">{draft.team}</span>
              </article>
              <article>
                <span className="subtle-label">Compensation</span>
                <strong>{draft.salaryRange}</strong>
                <span className="muted">{draft.joiningTimeline}</span>
              </article>
              <article>
                <span className="subtle-label">Location</span>
                <strong>{draft.locationMode}</strong>
                <span className="muted">{draft.relocation}</span>
              </article>
              <article>
                <span className="subtle-label">Experience</span>
                <strong>{draft.experienceLevel}</strong>
                <span className="muted">{draft.hiringPriority}</span>
              </article>
            </div>

            <div className="stack">
              <div className="summary-chip">
                <span className="subtle-label">Role mission</span>
                <strong>{draft.mission}</strong>
              </div>

              <div className="summary-chip">
                <span className="subtle-label">Core responsibilities</span>
                <p className="muted">{draft.responsibilities.join(" | ")}</p>
              </div>

              <div className="summary-chip">
                <span className="subtle-label">Must-have skills</span>
                <p className="muted">{draft.mustHaveSkills.join(" | ")}</p>
              </div>

              <div className="summary-chip">
                <span className="subtle-label">Manager interview prompts</span>
                <p className="muted">{draft.managerInterviewPrompts.join(" | ")}</p>
              </div>

              <div className="summary-chip">
                <span className="subtle-label">Approval note for HR</span>
                <p className="muted">{draft.hrSummary}</p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
