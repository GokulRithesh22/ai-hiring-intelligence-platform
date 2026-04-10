"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";

import {
  createRecruiterJobDraft,
  refineRecruiterJobDescription,
  updateRecruiterJobStatus
} from "@/lib/api-adapters";
import type {
  ManagerJdFeedbackAction,
  ManagerJobDescriptionVariant,
  ManagerJobDraftResult
} from "@/lib/types";

const feedbackActions: Array<{
  value: ManagerJdFeedbackAction;
  label: string;
}> = [
  { value: "TOO_GENERIC", label: "Too Generic" },
  { value: "TOO_COMPLEX", label: "Too Complex" },
  { value: "IMPROVE_RESPONSIBILITIES", label: "Improve Responsibilities" },
  { value: "MAKE_MORE_OUTCOME_FOCUSED", label: "Make More Outcome-Focused" }
];

export function RecruiterJobCreatePanel() {
  const [jobTitle, setJobTitle] = useState("Associate Center Manager");
  const [department, setDepartment] = useState("Center Operations");
  const [location, setLocation] = useState("Whitefield, Bengaluru");
  const [experienceLevel, setExperienceLevel] = useState("2-4 years");
  const [salaryRange, setSalaryRange] = useState("INR 300000 - 600000");
  const [joiningTimeline, setJoiningTimeline] = useState("Within 30 days");
  const [relocation, setRelocation] = useState("Open to nearby relocation if required");
  const [problem, setProblem] = useState(
    "Own daily center operations, improve member experience, and keep staff coordination strong during peak hours."
  );
  const [responsibilities, setResponsibilities] = useState(
    "Run opening and closing readiness\nCoordinate front desk, trainers, and housekeeping\nResolve complaints and track renewals\nMaintain daily center MIS and service quality"
  );
  const [skills, setSkills] = useState(
    "center operations, member experience, staff coordination, complaint resolution, reporting"
  );
  const [draft, setDraft] = useState<ManagerJobDraftResult | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeFeedback, setActiveFeedback] = useState<ManagerJdFeedbackAction | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedVariant = useMemo<ManagerJobDescriptionVariant | null>(() => {
    return draft?.variants.find((variant) => variant.id === selectedVariantId) ?? null;
  }, [draft, selectedVariantId]);

  const answers = useMemo(
    () => ({
      problem,
      responsibilities,
      skills,
      experience: experienceLevel,
      salary: salaryRange,
      joining: joiningTimeline,
      relocation
    }),
    [problem, responsibilities, skills, experienceLevel, salaryRange, joiningTimeline, relocation]
  );

  const handleGenerate = () => {
    startTransition(async () => {
      setErrorMessage(null);
      setMessage(null);

      try {
        const generated = await createRecruiterJobDraft({
          mode: "structured",
          jobTitle,
          department,
          location,
          experienceLevel,
          salaryRange,
          joiningTimeline,
          relocation,
          answers
        });
        setDraft(generated);
        setSelectedVariantId(generated.selectedVariantId);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Unable to generate job draft.");
      }
    });
  };

  const handleRefine = (feedback: ManagerJdFeedbackAction) => {
    if (!selectedVariantId) {
      return;
    }

    startTransition(async () => {
      setActiveFeedback(feedback);
      setErrorMessage(null);
      setMessage(null);

      try {
        const refined = await refineRecruiterJobDescription({
          jobId: draft?.jobId ?? null,
          jobTitle,
          mode: "structured",
          answers,
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
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Unable to refine job draft.");
      }
    });
  };

  const handlePublish = () => {
    if (!draft?.jobId) {
      return;
    }

    startTransition(async () => {
      setErrorMessage(null);
      setMessage(null);

      try {
        await updateRecruiterJobStatus(draft.jobId, "PUBLISHED");
        setMessage("Job published to the candidate landing page.");
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Unable to publish job.");
      }
    });
  };

  return (
    <div className="manager-layout">
      <section className="form-section card stack-lg">
        <div className="panel-heading">
          <div>
            <span className="subtle-label">Structured recruiter input</span>
            <h2>Create a JD without the older manager flow</h2>
          </div>
          <button className="button button-primary" disabled={isPending} onClick={handleGenerate} type="button">
            Generate 3 JD variations
          </button>
        </div>

        <div className="field-grid">
          <label className="field">
            <span>Role title</span>
            <input value={jobTitle} onChange={(event) => setJobTitle(event.target.value)} />
          </label>
          <label className="field">
            <span>Department</span>
            <input value={department} onChange={(event) => setDepartment(event.target.value)} />
          </label>
          <label className="field">
            <span>Location</span>
            <input value={location} onChange={(event) => setLocation(event.target.value)} />
          </label>
          <label className="field">
            <span>Experience range</span>
            <input
              value={experienceLevel}
              onChange={(event) => setExperienceLevel(event.target.value)}
            />
          </label>
          <label className="field">
            <span>Approved salary range</span>
            <input value={salaryRange} onChange={(event) => setSalaryRange(event.target.value)} />
          </label>
          <label className="field">
            <span>Joining timeline</span>
            <input
              value={joiningTimeline}
              onChange={(event) => setJoiningTimeline(event.target.value)}
            />
          </label>
        </div>

        <label className="field">
          <span>Business problem</span>
          <textarea rows={3} value={problem} onChange={(event) => setProblem(event.target.value)} />
        </label>

        <label className="field">
          <span>Responsibilities or outcomes</span>
          <textarea
            rows={4}
            value={responsibilities}
            onChange={(event) => setResponsibilities(event.target.value)}
          />
        </label>

        <label className="field">
          <span>Skills</span>
          <textarea rows={3} value={skills} onChange={(event) => setSkills(event.target.value)} />
        </label>

        <label className="field">
          <span>Relocation / office expectation</span>
          <input value={relocation} onChange={(event) => setRelocation(event.target.value)} />
        </label>
      </section>

      <aside className="form-section card stack-lg">
        <div className="panel-heading">
          <div>
            <span className="subtle-label">JD variations</span>
            <h2>Review and publish</h2>
          </div>
          <span className={`status-pill ${draft ? "status-approved" : "status-pending"}`}>
            {draft ? `${draft.variants.length} variations ready` : "Waiting on generation"}
          </span>
        </div>

        {!draft ? (
          <div className="empty-state">
            Generate the draft first. This recruiter view is intentionally simpler so the route is
            stable and demo-ready.
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
              <>
                <div className="shell-actions">
                  {feedbackActions.map((action) => (
                    <button
                      className={`button ${
                        activeFeedback === action.value ? "button-primary" : "button-secondary"
                      }`}
                      disabled={isPending}
                      key={action.value}
                      onClick={() => handleRefine(action.value)}
                      type="button"
                    >
                      {action.label}
                    </button>
                  ))}
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
                  <span className="subtle-label">Interview focus areas</span>
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
                  <Link className="button button-secondary" href="/dashboard/jobs">
                    Back to jobs
                  </Link>
                  {draft.jobId ? (
                    <>
                      <button className="button button-primary" disabled={isPending} onClick={handlePublish} type="button">
                        Publish job
                      </button>
                      <Link className="button button-secondary" href={`/dashboard/jobs/${draft.jobId}`}>
                        Open candidate pipeline
                      </Link>
                    </>
                  ) : null}
                </div>
              </>
            ) : null}
          </div>
        )}

        {!message ? null : <span className="status-pill status-approved">{message}</span>}
        {!errorMessage ? null : <span className="status-pill status-review">{errorMessage}</span>}
      </aside>
    </div>
  );
}
