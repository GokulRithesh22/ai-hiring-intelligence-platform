"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import {
  createManagerJobDraft,
  refineManagerJobDescription
} from "@/lib/api-adapters";
import type {
  JobIntakeQuestion,
  ManagerCreationMode,
  ManagerJdFeedbackAction,
  ManagerJobDraftResult
} from "@/lib/types";

type JobIntakeStudioProps = {
  questions: JobIntakeQuestion[];
};

const feedbackActions: Array<{
  value: ManagerJdFeedbackAction;
  label: string;
}> = [
  { value: "TOO_GENERIC", label: "Too Generic" },
  { value: "TOO_COMPLEX", label: "Too Complex" },
  { value: "IMPROVE_RESPONSIBILITIES", label: "Improve Responsibilities" },
  { value: "MAKE_MORE_OUTCOME_FOCUSED", label: "Make More Outcome-Focused" }
];

const structuredPrompts: Record<string, string> = {
  problem: "Business problem the role must solve",
  responsibilities: "Responsibilities or success outcomes",
  skills: "Required skills",
  experience: "Experience level",
  salary: "Approved salary range",
  joining: "Target joining timeline",
  relocation: "Relocation or office expectation"
};

export function JobIntakeStudio({ questions }: JobIntakeStudioProps) {
  const [mode, setMode] = useState<ManagerCreationMode>("structured");
  const [jobTitle, setJobTitle] = useState("Growth Marketing Manager");
  const [department, setDepartment] = useState("Growth and Revenue");
  const [location, setLocation] = useState("Bengaluru hybrid");
  const [experienceLevel, setExperienceLevel] = useState("6-8 years");
  const [salaryRange, setSalaryRange] = useState("INR 2600000 - 3400000");
  const [joiningTimeline, setJoiningTimeline] = useState("Within 45 days");
  const [relocation, setRelocation] = useState("Preferred, but flexible for the right candidate");
  const [draftJobTitle, setDraftJobTitle] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [conversationAnswers, setConversationAnswers] = useState<Record<string, string>>({});
  const [structuredAnswers, setStructuredAnswers] = useState<Record<string, string>>({
    problem: "Own acquisition efficiency and improve revenue-qualified pipeline generation across paid, lifecycle, and analytics.",
    responsibilities:
      "Own cross-channel growth strategy\nPartner with product, sales, and analytics\nDesign experiments that improve CAC efficiency",
    skills:
      "Performance marketing, experimentation, attribution, lifecycle automation, SQL, stakeholder communication"
  });
  const [draft, setDraft] = useState<ManagerJobDraftResult | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [activeFeedback, setActiveFeedback] = useState<ManagerJdFeedbackAction | null>(null);
  const [isPending, startTransition] = useTransition();

  const answerMap = mode === "conversational" ? conversationAnswers : structuredAnswers;
  const answeredCount =
    mode === "conversational"
      ? Object.keys(conversationAnswers).length
      : [
          structuredAnswers.problem,
          structuredAnswers.responsibilities,
          structuredAnswers.skills,
          experienceLevel,
          salaryRange,
          joiningTimeline,
          relocation
        ].filter((value) => value.trim()).length;
  const progressBase = mode === "conversational" ? questions.length : 7;
  const progress = Math.min(100, Math.round((answeredCount / progressBase) * 100));

  const conversation: Array<{ role: "ai" | "user"; text: string }> = [];

  if (draftJobTitle) {
    questions.forEach((question, index) => {
      if (index <= activeIndex) {
        conversation.push({ role: "ai", text: question.prompt });
      }

      const answer = conversationAnswers[question.id];

      if (answer) {
        conversation.push({ role: "user", text: answer });
      }
    });
  }

  const selectedVariant = draft?.variants.find((variant) => variant.id === selectedVariantId) ?? null;

  const variantLabel = selectedVariant?.label ?? "Select a variation";

  const submitDraftGeneration = (overrideAnswers?: Record<string, string>) => {
    const normalizedTitle = jobTitle.trim();

    if (!normalizedTitle) {
      return;
    }

    const nextAnswers =
      mode === "conversational"
        ? (overrideAnswers ?? conversationAnswers)
        : {
            ...structuredAnswers,
            experience: experienceLevel,
            salary: salaryRange,
            joining: joiningTimeline,
            relocation
          };

    startTransition(async () => {
      const generated = await createManagerJobDraft({
        mode,
        jobTitle: normalizedTitle,
        department,
        location,
        experienceLevel,
        salaryRange,
        joiningTimeline,
        relocation,
        answers: nextAnswers
      });
      setDraft(generated);
      setSelectedVariantId(generated.selectedVariantId);
      setActiveFeedback(null);
    });
  };

  const handleStartConversation = () => {
    const normalizedTitle = jobTitle.trim();

    if (!normalizedTitle) {
      return;
    }

    setDraftJobTitle(normalizedTitle);
    setActiveIndex(0);
    setCurrentAnswer("");
    setConversationAnswers({});
    setDraft(null);
    setSelectedVariantId(null);
    setActiveFeedback(null);
  };

  const handleSubmitAnswer = () => {
    const question = questions[activeIndex];
    const normalizedAnswer = currentAnswer.trim();

    if (!question || !normalizedAnswer) {
      return;
    }

    const nextAnswers = {
      ...conversationAnswers,
      [question.id]: normalizedAnswer
    };

    setConversationAnswers(nextAnswers);
    setCurrentAnswer("");

    if (activeIndex < questions.length - 1) {
      setActiveIndex((current) => current + 1);
      return;
    }

    submitDraftGeneration(nextAnswers);
  };

  const handleStructuredChange = (key: string, value: string) => {
    setStructuredAnswers((current) => ({
      ...current,
      [key]: value
    }));
    setDraft(null);
    setSelectedVariantId(null);
    setActiveFeedback(null);
  };

  const handleGenerate = () => {
    if (mode === "conversational" && !draftJobTitle) {
      handleStartConversation();
      return;
    }

    submitDraftGeneration();
  };

  const handleFeedback = (feedback: ManagerJdFeedbackAction) => {
    if (!selectedVariantId) {
      return;
    }

    setActiveFeedback(feedback);

    startTransition(async () => {
      const refined = await refineManagerJobDescription({
        jobId: draft?.jobId ?? null,
        jobTitle: jobTitle.trim(),
        mode,
        answers:
          mode === "conversational"
            ? conversationAnswers
            : {
                ...structuredAnswers,
                experience: experienceLevel,
                salary: salaryRange,
                joining: joiningTimeline,
                relocation
              },
        selectedVariantId,
        feedback,
        variants: draft?.variants ?? [],
        department,
        location,
        experienceLevel,
        salaryRange,
        joiningTimeline,
        relocation
      });

      setDraft(refined);
      setSelectedVariantId(refined.selectedVariantId);
    });
  };

  const renderModeTabs = () => (
    <div className="shell-actions">
      <button
        className={`button ${mode === "conversational" ? "button-primary" : "button-secondary"}`}
        onClick={() => setMode("conversational")}
        type="button"
      >
        Conversational AI mode
      </button>
      <button
        className={`button ${mode === "structured" ? "button-primary" : "button-secondary"}`}
        onClick={() => setMode("structured")}
        type="button"
      >
        Structured input mode
      </button>
    </div>
  );

  return (
    <div className="manager-layout">
      <section className="form-section card stack-lg">
        <div className="panel-heading">
          <div>
            <span className="subtle-label">JD creation studio</span>
            <h2>Build a manager-ready job description in two ways</h2>
          </div>
          <span className="status-pill status-progress">{progress}% complete</span>
        </div>

        {renderModeTabs()}

        <div className="field-grid">
          <label className="field">
            <span>Job title</span>
            <input
              value={jobTitle}
              onChange={(event) => setJobTitle(event.target.value)}
              placeholder="Growth Marketing Manager"
            />
          </label>
          <label className="field">
            <span>Department</span>
            <input
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
              placeholder="Growth and Revenue"
            />
          </label>
          <label className="field">
            <span>Location</span>
            <input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Bengaluru hybrid"
            />
          </label>
          <label className="field">
            <span>Target experience</span>
            <input
              value={experienceLevel}
              onChange={(event) => setExperienceLevel(event.target.value)}
              placeholder="6-8 years"
            />
          </label>
          <label className="field">
            <span>Approved salary range</span>
            <input
              value={salaryRange}
              onChange={(event) => setSalaryRange(event.target.value)}
              placeholder="INR 2600000 - 3400000"
            />
          </label>
          <label className="field">
            <span>Joining timeline</span>
            <input
              value={joiningTimeline}
              onChange={(event) => setJoiningTimeline(event.target.value)}
              placeholder="Within 45 days"
            />
          </label>
        </div>

        <label className="field">
          <span>Relocation or office expectation</span>
          <input
            value={relocation}
            onChange={(event) => setRelocation(event.target.value)}
            placeholder="Preferred but flexible for the right candidate"
          />
        </label>

        {mode === "conversational" ? (
          <div className="stack-lg">
            <div className="shell-actions">
              <button className="button button-primary" onClick={handleStartConversation} type="button">
                Begin AI intake
              </button>
              <span className="muted">
                AI asks structured questions about role problem, skills, seniority, salary,
                joining window, and relocation.
              </span>
            </div>

            <div className="chat-feed">
              {!draftJobTitle ? (
                <div className="empty-state">
                  Start the conversation to collect structured intake answers from the manager side.
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
              <span>{questions[activeIndex]?.label ?? "AI intake complete"}</span>
              <textarea
                disabled={isPending || !questions[activeIndex] || !draftJobTitle}
                rows={4}
                value={currentAnswer}
                onChange={(event) => setCurrentAnswer(event.target.value)}
                placeholder={
                  questions[activeIndex]?.placeholder ??
                  "The AI intake is complete. Generate JD variations from the collected inputs."
                }
              />
            </div>

            <div className="shell-actions">
              <button
                className="button button-primary"
                type="button"
                onClick={handleSubmitAnswer}
                disabled={isPending || !questions[activeIndex] || !draftJobTitle}
              >
                {activeIndex < questions.length - 1 ? "Send answer" : "Generate 3 JD variations"}
              </button>
            </div>
          </div>
        ) : (
          <div className="stack-lg">
            <div className="panel-heading">
              <div>
                <span className="subtle-label">Structured brief</span>
                <h3>Enter the essentials directly</h3>
              </div>
              <button className="button button-primary" onClick={handleGenerate} type="button">
                Generate 3 JD variations
              </button>
            </div>

            <div className="stack" style={{ gap: 14 }}>
              {Object.entries(structuredPrompts).map(([key, label]) => (
                <label className="field" key={key}>
                  <span>{label}</span>
                  <textarea
                    rows={key === "responsibilities" ? 4 : 3}
                    value={key === "experience" ? experienceLevel : key === "salary" ? salaryRange : key === "joining" ? joiningTimeline : key === "relocation" ? relocation : answerMap[key] ?? ""}
                    onChange={(event) => {
                      const value = event.target.value;

                      if (key === "experience") {
                        setExperienceLevel(value);
                        return;
                      }

                      if (key === "salary") {
                        setSalaryRange(value);
                        return;
                      }

                      if (key === "joining") {
                        setJoiningTimeline(value);
                        return;
                      }

                      if (key === "relocation") {
                        setRelocation(value);
                        return;
                      }

                      handleStructuredChange(key, value);
                    }}
                    placeholder={label}
                  />
                </label>
              ))}
            </div>
          </div>
        )}
      </section>

      <aside className="form-section card stack-lg">
        <div className="panel-heading">
          <div>
            <span className="subtle-label">JD variations</span>
            <h2>Compare, refine, and select the best draft</h2>
          </div>
          <span className={`status-pill ${draft ? "status-approved" : "status-pending"}`}>
            {draft ? `${draft.variants.length} variations ready` : "Waiting on inputs"}
          </span>
        </div>

        {!draft ? (
          <div className="empty-state">
            <div>
              Generate the job description to compare 2-3 AI variations and refine the one that
              best fits the hiring context.
            </div>
            {mode === "conversational" && !draftJobTitle ? (
              <div className="muted" style={{ marginTop: 10 }}>
                In conversational mode, start the AI intake first. For the fastest draft, switch to
                structured input and generate immediately.
              </div>
            ) : null}
          </div>
        ) : (
          <div className="stack-lg">
            <div
              style={{
                display: "grid",
                gap: 12,
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))"
              }}
            >
              {draft.variants.map((variant) => {
                const isActive = selectedVariantId === variant.id;

                return (
                  <button
                    className="summary-chip"
                    key={variant.id}
                    onClick={() => setSelectedVariantId(variant.id)}
                    style={{
                      textAlign: "left",
                      background: isActive ? "rgba(74, 108, 247, 0.09)" : undefined,
                      borderColor: isActive ? "rgba(74, 108, 247, 0.24)" : undefined
                    }}
                    type="button"
                  >
                    <span className="subtle-label">{variant.tone}</span>
                    <strong>{variant.label}</strong>
                    <span className="muted">{variant.summary}</span>
                  </button>
                );
              })}
            </div>

            {selectedVariant ? (
              <div className="stack-lg">
                <div className="summary-grid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
                  <article className="summary-chip">
                    <span className="subtle-label">Selected variation</span>
                    <strong>{variantLabel}</strong>
                    <span className="muted">Best-fit direction for this role</span>
                  </article>
                  <article className="summary-chip">
                    <span className="subtle-label">Mode</span>
                    <strong>{mode === "conversational" ? "Conversational AI" : "Structured input"}</strong>
                    <span className="muted">Creation path used for this draft</span>
                  </article>
                  <article className="summary-chip">
                    <span className="subtle-label">Feedback</span>
                    <strong>
                      {activeFeedback
                        ? feedbackActions.find((item) => item.value === activeFeedback)?.label
                        : "No targeted refinement yet"}
                    </strong>
                    <span className="muted">Refine until the JD feels right</span>
                  </article>
                </div>

                <div className="stack" style={{ gap: 10 }}>
                  <span className="subtle-label">Targeted improvements</span>
                  <div className="shell-actions">
                    {feedbackActions.map((action) => (
                      <button
                        className={`button ${
                          activeFeedback === action.value ? "button-primary" : "button-secondary"
                        }`}
                        disabled={isPending}
                        key={action.value}
                        onClick={() => handleFeedback(action.value)}
                        type="button"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="summary-chip">
                  <span className="subtle-label">Responsibilities</span>
                  <div className="stack" style={{ gap: 8 }}>
                    {selectedVariant.responsibilities.map((responsibility) => (
                      <span className="muted" key={responsibility}>
                        {responsibility}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="summary-chip">
                  <span className="subtle-label">Manager interview focus areas</span>
                  <p className="muted" style={{ margin: 0 }}>
                    {selectedVariant.focusAreas.join(" | ")}
                  </p>
                </div>

                <div className="summary-chip">
                  <span className="subtle-label">JD draft</span>
                  <pre
                    style={{
                      margin: 0,
                      whiteSpace: "pre-wrap",
                      fontFamily: "inherit",
                      color: "var(--color-text)"
                    }}
                  >
                    {selectedVariant.description}
                  </pre>
                </div>

                <div className="shell-actions">
                  <Link className="button button-secondary" href="/manager/dashboard">
                    Open manager dashboard
                  </Link>
                  {draft.jobId ? (
                    <Link className="button button-primary" href={`/manager/jobs/${draft.jobId}`}>
                      Open candidate intelligence entry point
                    </Link>
                  ) : (
                    <span className="muted">
                      Candidate intelligence entry activates automatically when the draft is persisted
                      via authenticated manager mode.
                    </span>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </aside>
    </div>
  );
}
