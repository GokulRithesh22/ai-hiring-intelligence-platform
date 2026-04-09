"use client";

import { useState, useTransition } from "react";
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
    fullName: "Aarav Mehta",
    email: "aarav.mehta@example.com",
    phone: "+91 9876543210",
    linkedInUrl: "",
    resumeFile: null,
    earliestJoiningDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
      .toISOString()
      .slice(0, 10),
    expectedCtc: "2800000",
    relocation: "Open"
  });
  const [result, setResult] = useState<ApplicationSubmissionResult | null>(null);
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
    if (!form.resumeFile) {
      return;
    }

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
            <span>Phone</span>
            <input
              value={form.phone ?? ""}
              onChange={(event) => updateField("phone", event.target.value)}
            />
          </label>
          <label className="field">
            <span>LinkedIn URL</span>
            <input
              type="url"
              placeholder="Optional LinkedIn profile URL"
              value={form.linkedInUrl ?? ""}
              onChange={(event) => updateField("linkedInUrl", event.target.value)}
            />
          </label>
          <label className="field">
            <span>Earliest joining date</span>
            <input
              type="date"
              value={form.earliestJoiningDate}
              onChange={(event) => updateField("earliestJoiningDate", event.target.value)}
            />
          </label>
          <label className="field">
            <span>Expected CTC</span>
            <input
              value={form.expectedCtc}
              onChange={(event) => updateField("expectedCtc", event.target.value)}
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
            Supported formats: PDF, DOCX, and TXT.
          </span>
          <input
            type="file"
            accept=".pdf,.docx,.txt"
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
            disabled={isPending || !form.resumeFile}
          >
            {isPending ? "Running screening..." : "Submit application"}
          </button>
          <span className="muted">Your resume is analyzed against the role requirements.</span>
        </div>

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

            <div className="question-list">
              {result.interviewQuestions.map((question, index) => (
                <article className="question-item" key={question}>
                  <strong>Question {index + 1}</strong>
                  <p className="muted">{question}</p>
                </article>
              ))}
            </div>

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
