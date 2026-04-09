"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { submitCandidateApplication } from "@/lib/api-adapters";
import { VoiceInterviewPanel } from "@/components/candidate/voice-interview-panel";
import type {
  ApplicationSubmissionResult,
  ApplicationPortalData,
  CandidateApplicationPayload
} from "@/lib/types";

type CandidateApplicationPortalProps = {
  portal: ApplicationPortalData;
};

export function CandidateApplicationPortal({
  portal
}: CandidateApplicationPortalProps) {
  const [form, setForm] = useState<CandidateApplicationPayload>({
    jobId: portal.job.id,
    fullName: "",
    email: "",
    phone: "",
    linkedInUrl: "",
    resumeFile: null,
    earliestJoiningDate: "",
    expectedCtc: "",
    relocation: ""
  });
  const [result, setResult] = useState<ApplicationSubmissionResult | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isFormComplete =
    form.fullName.trim().length > 1 &&
    form.email.trim().length > 3 &&
    (form.phone?.trim().length ?? 0) > 3 &&
    (form.linkedInUrl?.trim().length ?? 0) > 3 &&
    form.earliestJoiningDate.trim().length > 0 &&
    form.expectedCtc.trim().length > 0 &&
    form.relocation.trim().length > 0 &&
    form.resumeFile !== null;

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
    if (!isFormComplete) {
      setValidationMessage("Complete every required field before continuing.");
      return;
    }

    setValidationMessage(null);

    startTransition(async () => {
      const response = await submitCandidateApplication(form);
      setResult(response);
    });
  };

  return (
    <div className="candidate-layout">
      <section className="form-section card stack-lg">
        <div className="landing-nav surface" style={{ marginBottom: 0 }}>
          <Link className="brand" href="/">
            <span className="brand-mark">AI</span>
            <span>Hiring Intelligence</span>
          </Link>
          <Link className="button button-secondary" href="/">
            Back to jobs
          </Link>
        </div>

        <div className="panel-heading" style={{ marginTop: 18 }}>
          <div>
            <span className="subtle-label">Open role</span>
            <h2>{portal.job.title}</h2>
            <p className="supporting-copy">{portal.job.summary}</p>
          </div>
          <span className="status-pill status-active">{portal.job.location}</span>
        </div>

        <div className="summary-grid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
          <article>
            <span className="subtle-label">Experience</span>
            <strong>{portal.job.experienceLevel}</strong>
            <span className="muted">Preferred profile</span>
          </article>
          <article>
            <span className="subtle-label">Location</span>
            <strong>{portal.job.location}</strong>
            <span className="muted">Current opening</span>
          </article>
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
              required
              placeholder="Enter your full name"
              value={form.fullName}
              onChange={(event) => updateField("fullName", event.target.value)}
            />
          </label>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              required
              placeholder="Enter your email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
            />
          </label>
          <label className="field">
            <span>Phone</span>
            <input
              required
              placeholder="Enter your phone number"
              value={form.phone ?? ""}
              onChange={(event) => updateField("phone", event.target.value)}
            />
          </label>
          <label className="field">
            <span>LinkedIn URL</span>
            <input
              type="url"
              required
              placeholder="https://linkedin.com/in/username"
              value={form.linkedInUrl ?? ""}
              onChange={(event) => updateField("linkedInUrl", event.target.value)}
            />
          </label>
          <label className="field">
            <span>Earliest joining date</span>
            <input
              type="date"
              required
              value={form.earliestJoiningDate}
              onChange={(event) => updateField("earliestJoiningDate", event.target.value)}
            />
          </label>
          <label className="field">
            <span>Expected CTC</span>
            <input
              required
              placeholder="Enter expected CTC"
              value={form.expectedCtc}
              onChange={(event) => updateField("expectedCtc", event.target.value)}
            />
          </label>
          <label className="field">
            <span>Relocation willingness</span>
            <select
              required
              value={form.relocation}
              onChange={(event) => updateField("relocation", event.target.value)}
            >
              <option value="">Select an option</option>
              <option value="Open">Open</option>
              <option value="Not needed">Not needed</option>
              <option value="Declined">Declined</option>
            </select>
          </label>
        </div>

        <label className="dropzone">
          <span>Resume upload</span>
          <span className="muted">
            Supported formats: PDF, DOCX, and TXT.
          </span>
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            required
            onChange={(event) =>
              updateField("resumeFile", event.target.files?.[0] ?? null)
            }
          />
          <span className="muted">
            {form.resumeFile ? `Attached: ${form.resumeFile.name}` : "No file selected yet"}
          </span>
        </label>

        <div className="shell-actions">
          <button
            className="button button-primary"
            type="button"
            onClick={handleSubmit}
            disabled={isPending || !isFormComplete}
          >
            {isPending ? "Running screening..." : "Submit application"}
          </button>
        </div>

        {validationMessage ? <p className="muted">{validationMessage}</p> : null}

        {!result ? null : (
          <div className="stack">
            <article className="history-item">
              <div className="panel-heading">
                <div>
                  <strong>Application submitted</strong>
                  <p className="muted">{result.statusMessage}</p>
                </div>
                <span
                  className={`status-pill ${result.status === "qualified" ? "status-approved" : "status-progress"}`}
                >
                  {result.status === "qualified" ? "Interview invited" : "Under review"}
                </span>
              </div>
              <p className="muted">
                {result.interviewInvitation ??
                  "We have stored your application and will email you if the next stage opens."}
              </p>
            </article>

            {result.interviewQuestions.length === 0 ? null : (
              <VoiceInterviewPanel
                questions={result.interviewQuestions}
                interviewSessionId={result.interviewSessionId ?? null}
                applicationId={result.applicationId}
              />
            )}
          </div>
        )}
      </section>
    </div>
  );
}
