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

function isValidLinkedInUrl(value: string) {
  try {
    const url = new URL(value);
    return url.hostname.includes("linkedin.com");
  } catch {
    return false;
  }
}

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
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [isPending, startTransition] = useTransition();

  const fieldErrors = {
    fullName: form.fullName.trim().length > 1 ? null : "Full name is required.",
    email: form.email.trim().length > 3 ? null : "Email is required.",
    phone: (form.phone?.trim().length ?? 0) > 3 ? null : "Phone is required.",
    linkedInUrl:
      (form.linkedInUrl?.trim().length ?? 0) === 0
        ? "LinkedIn URL is required."
        : isValidLinkedInUrl(form.linkedInUrl ?? "")
          ? null
          : "Enter a valid LinkedIn profile URL.",
    earliestJoiningDate:
      form.earliestJoiningDate.trim().length > 0 ? null : "Earliest joining date is required.",
    expectedCtc:
      form.expectedCtc.trim().length > 0
        ? null
        : "Expected CTC is required.",
    relocation:
      form.relocation.trim().length > 0 ? null : "Relocation willingness is required.",
    resumeFile: form.resumeFile ? null : "Resume upload is required."
  };

  const isFormComplete = Object.values(fieldErrors).every((error) => error === null);

  const updateField = <K extends keyof CandidateApplicationPayload>(
    field: K,
    value: CandidateApplicationPayload[K]
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
    setTouchedFields((current) => ({
      ...current,
      [field]: true
    }));
  };

  const markFieldTouched = (field: keyof CandidateApplicationPayload | "resumeFile") => {
    setTouchedFields((current) => ({
      ...current,
      [field]: true
    }));
  };

  const handleSubmit = () => {
    if (!isFormComplete) {
      setValidationMessage("Complete every required field before continuing.");
      setTouchedFields({
        fullName: true,
        email: true,
        phone: true,
        linkedInUrl: true,
        earliestJoiningDate: true,
        expectedCtc: true,
        relocation: true,
        resumeFile: true
      });
      return;
    }

    setValidationMessage(null);
    setSubmitError(null);

    startTransition(async () => {
      try {
        const response = await submitCandidateApplication(form);
        setResult(response);
      } catch (error) {
        setSubmitError(
          error instanceof Error
            ? error.message
            : "We couldn't submit your application right now."
        );
      }
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
          <label className={`field ${touchedFields.fullName && fieldErrors.fullName ? "field-error" : ""}`}>
            <span>Full name *</span>
            <input
              required
              placeholder="Enter your full name"
              value={form.fullName}
              onChange={(event) => updateField("fullName", event.target.value)}
              onBlur={() => markFieldTouched("fullName")}
            />
            {touchedFields.fullName && fieldErrors.fullName ? (
              <span className="field-error-text">{fieldErrors.fullName}</span>
            ) : null}
          </label>
          <label className={`field ${touchedFields.email && fieldErrors.email ? "field-error" : ""}`}>
            <span>Email *</span>
            <input
              type="email"
              required
              placeholder="Enter your email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              onBlur={() => markFieldTouched("email")}
            />
            {touchedFields.email && fieldErrors.email ? (
              <span className="field-error-text">{fieldErrors.email}</span>
            ) : null}
          </label>
          <label className={`field ${touchedFields.phone && fieldErrors.phone ? "field-error" : ""}`}>
            <span>Phone *</span>
            <input
              required
              placeholder="Enter your phone number"
              value={form.phone ?? ""}
              onChange={(event) => updateField("phone", event.target.value)}
              onBlur={() => markFieldTouched("phone")}
            />
            {touchedFields.phone && fieldErrors.phone ? (
              <span className="field-error-text">{fieldErrors.phone}</span>
            ) : null}
          </label>
          <label className={`field ${touchedFields.linkedInUrl && fieldErrors.linkedInUrl ? "field-error" : ""}`}>
            <span>LinkedIn URL *</span>
            <input
              type="url"
              required
              placeholder="https://linkedin.com/in/username"
              value={form.linkedInUrl ?? ""}
              onChange={(event) => updateField("linkedInUrl", event.target.value)}
              onBlur={() => markFieldTouched("linkedInUrl")}
            />
            {touchedFields.linkedInUrl && fieldErrors.linkedInUrl ? (
              <span className="field-error-text">{fieldErrors.linkedInUrl}</span>
            ) : null}
          </label>
          <label className={`field ${touchedFields.earliestJoiningDate && fieldErrors.earliestJoiningDate ? "field-error" : ""}`}>
            <span>Earliest joining date *</span>
            <input
              type="date"
              required
              value={form.earliestJoiningDate}
              onChange={(event) => updateField("earliestJoiningDate", event.target.value)}
              onBlur={() => markFieldTouched("earliestJoiningDate")}
            />
            {touchedFields.earliestJoiningDate && fieldErrors.earliestJoiningDate ? (
              <span className="field-error-text">{fieldErrors.earliestJoiningDate}</span>
            ) : null}
          </label>
          <label className={`field ${touchedFields.expectedCtc && fieldErrors.expectedCtc ? "field-error" : ""}`}>
            <span>Expected CTC *</span>
            <input
              required
              placeholder="Enter expected CTC"
              value={form.expectedCtc}
              onChange={(event) => updateField("expectedCtc", event.target.value)}
              onBlur={() => markFieldTouched("expectedCtc")}
            />
            {touchedFields.expectedCtc && fieldErrors.expectedCtc ? (
              <span className="field-error-text">{fieldErrors.expectedCtc}</span>
            ) : null}
          </label>
          <label className={`field ${touchedFields.relocation && fieldErrors.relocation ? "field-error" : ""}`}>
            <span>Relocation willingness *</span>
            <select
              required
              value={form.relocation}
              onChange={(event) => updateField("relocation", event.target.value)}
              onBlur={() => markFieldTouched("relocation")}
            >
              <option value="">Select an option</option>
              <option value="Open">Open</option>
              <option value="Not needed">Not needed</option>
              <option value="Declined">Declined</option>
            </select>
            {touchedFields.relocation && fieldErrors.relocation ? (
              <span className="field-error-text">{fieldErrors.relocation}</span>
            ) : null}
          </label>
        </div>

        <label className={`dropzone ${touchedFields.resumeFile && fieldErrors.resumeFile ? "field-error" : ""}`}>
          <span>Resume upload *</span>
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
            onBlur={() => markFieldTouched("resumeFile")}
          />
          <span className="muted">
            {form.resumeFile ? `Attached: ${form.resumeFile.name}` : "No file selected yet"}
          </span>
          {touchedFields.resumeFile && fieldErrors.resumeFile ? (
            <span className="field-error-text">{fieldErrors.resumeFile}</span>
          ) : null}
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
        {submitError ? <div className="status-pill status-stop">{submitError}</div> : null}

        {!result ? null : (
          <div className="stack">
            <article className="history-item">
              <div className="panel-heading">
                <div>
                  <strong>Application submitted</strong>
                  <p className="muted">{result.statusMessage}</p>
                </div>
                <span
                  className={`status-pill ${result.status === "qualified" ? "status-approved" : "status-stop"}`}
                >
                  {result.status === "qualified" ? "Interview invited" : "Application received"}
                </span>
              </div>
              {result.status === "qualified" ? (
                <p className="muted">
                  {result.interviewInvitation ??
                    "We have stored your application and will email you if the next stage opens."}
                </p>
              ) : null}
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
