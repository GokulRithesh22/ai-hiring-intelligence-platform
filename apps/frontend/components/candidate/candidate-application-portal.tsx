"use client";

import { useState, useTransition } from "react";
import { submitCandidateApplication } from "@/lib/api-adapters";
import type {
  ApplicationPortalData,
  CandidateApplicationPayload,
  ScreeningResult
} from "@/lib/types";

type CandidateApplicationPortalProps = {
  portal: ApplicationPortalData;
};

export function CandidateApplicationPortal({
  portal
}: CandidateApplicationPortalProps) {
  const [form, setForm] = useState<CandidateApplicationPayload>({
    jobId: portal.job.id,
    fullName: "Aarav Mehta",
    email: "aarav.mehta@example.com",
    linkedInUrl: "https://www.linkedin.com/in/aarav-mehta",
    resumeFileName: "",
    joiningTimeline: "30 days",
    salaryExpectation: "₹28L",
    relocation: "Open"
  });
  const [result, setResult] = useState<ScreeningResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const updateField = <K extends keyof CandidateApplicationPayload>(
    field: K,
    value: CandidateApplicationPayload[K]
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    startTransition(async () => {
      const response = await submitCandidateApplication(form);
      setResult(response);
    });
  };

  return (
    <div className="candidate-layout">
      <section className="form-section card stack-lg">
        <div className="panel-heading">
          <div>
            <span className="subtle-label">Open role</span>
            <h2>{portal.job.title}</h2>
            <p className="supporting-copy">{portal.job.summary}</p>
          </div>
          <span className="status-pill status-active">{portal.job.location}</span>
        </div>

        <div className="summary-grid">
          <article>
            <span className="subtle-label">Experience</span>
            <strong>{portal.job.experienceLevel}</strong>
            <span className="muted">Preferred profile</span>
          </article>
          <article>
            <span className="subtle-label">Compensation</span>
            <strong>{portal.job.salaryRange}</strong>
            <span className="muted">Approved range</span>
          </article>
          <article>
            <span className="subtle-label">Join by</span>
            <strong>{portal.job.joiningTimeline}</strong>
            <span className="muted">Target start date</span>
          </article>
          <article>
            <span className="subtle-label">Relocation</span>
            <strong>{portal.job.relocation}</strong>
            <span className="muted">Constraint</span>
          </article>
        </div>

        <div className="pipeline-list">
          {portal.pipeline.map((step) => (
            <article className="pipeline-item" key={step.title}>
              <div className="panel-heading">
                <div>
                  <strong>{step.title}</strong>
                  <p className="muted">{step.description}</p>
                </div>
                <span className={`status-pill ${step.statusClass}`}>{step.status}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="form-section card stack-lg">
        <div className="panel-heading">
          <div>
            <span className="subtle-label">Candidate submission</span>
            <h2>Apply in one flow</h2>
          </div>
          <span className={`status-pill ${result ? "status-approved" : "status-pending"}`}>
            {result ? "Screened" : "Awaiting submission"}
          </span>
        </div>

        <div className="form-grid">
          <label className="field">
            <span>Full name</span>
            <input
              value={form.fullName}
              onChange={(event) => updateField("fullName", event.target.value)}
            />
          </label>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
            />
          </label>
          <label className="field">
            <span>LinkedIn URL</span>
            <input
              value={form.linkedInUrl}
              onChange={(event) => updateField("linkedInUrl", event.target.value)}
            />
          </label>
          <label className="field">
            <span>Joining timeline</span>
            <select
              value={form.joiningTimeline}
              onChange={(event) => updateField("joiningTimeline", event.target.value)}
            >
              <option value="30 days">30 days</option>
              <option value="45 days">45 days</option>
              <option value="60 days">60 days</option>
            </select>
          </label>
          <label className="field">
            <span>Expected salary</span>
            <input
              value={form.salaryExpectation}
              onChange={(event) => updateField("salaryExpectation", event.target.value)}
            />
          </label>
          <label className="field">
            <span>Relocation willingness</span>
            <select
              value={form.relocation}
              onChange={(event) => updateField("relocation", event.target.value)}
            >
              <option value="Open">Open</option>
              <option value="Not needed">Not needed</option>
              <option value="Declined">Declined</option>
            </select>
          </label>
        </div>

        <label className="dropzone">
          <span>Resume upload</span>
          <span className="muted">
            Object storage integration can replace this with signed upload URLs.
          </span>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(event) =>
              updateField("resumeFileName", event.target.files?.[0]?.name ?? "")
            }
          />
          <span className="muted">
            {form.resumeFileName ? `Attached: ${form.resumeFileName}` : "No file selected yet"}
          </span>
        </label>

        <div className="shell-actions">
          <button className="button button-primary" type="button" onClick={handleSubmit}>
            {isPending ? "Running screening..." : "Submit application"}
          </button>
          <span className="muted">
            The mock adapter returns resume matching, qualification fit, and interview
            readiness.
          </span>
        </div>

        {!result ? null : (
          <div className="stack">
            <div className="summary-grid">
              <article>
                <span className="subtle-label">Resume score</span>
                <strong>{result.resumeScore}</strong>
                <span className="muted">{result.resumeAssessment}</span>
              </article>
              <article>
                <span className="subtle-label">Qualification fit</span>
                <strong>{result.qualificationResult}</strong>
                <span className="muted">{result.qualificationReason}</span>
              </article>
              <article>
                <span className="subtle-label">Pipeline decision</span>
                <strong>{result.nextStep}</strong>
                <span className="muted">{result.statusMessage}</span>
              </article>
              <article>
                <span className="subtle-label">Interview plan</span>
                <strong>{result.interviewQuestions.length} questions</strong>
                <span className="muted">AI-generated from resume and role</span>
              </article>
            </div>

            <div className="question-list">
              {result.interviewQuestions.map((question, index) => (
                <article className="question-item" key={question}>
                  <strong>Question {index + 1}</strong>
                  <p className="muted">{question}</p>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
