"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type RecruiterJobEditorProps = {
  job: {
    id: string;
    title: string;
    location: string | null;
    description: string;
    status: string;
  };
};

export function RecruiterJobEditor({ job }: RecruiterJobEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(job.title);
  const [location, setLocation] = useState(job.location ?? "");
  const [description, setDescription] = useState(job.description);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const updateJob = (action: "save" | "publish" | "pause" | "close") => {
    startTransition(async () => {
      setMessage(null);

      if (action === "save") {
        const response = await fetch(`/api/recruiter/jobs/${job.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            title,
            location,
            generatedDescription: description
          })
        });

        if (!response.ok) {
          setMessage("Unable to save job updates.");
          return;
        }

        setMessage("Job updated.");
        router.refresh();
        return;
      }

      const status = action === "publish" ? "PUBLISHED" : action === "pause" ? "PAUSED" : "CLOSED";
      const response = await fetch(`/api/recruiter/jobs/${job.id}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        setMessage("Unable to update job status.");
        return;
      }

      setMessage(`Job ${action}d successfully.`);
      router.refresh();
    });
  };

  return (
    <section className="card stack-lg" style={{ padding: 24 }}>
      <div className="panel-heading">
        <div>
          <span className="subtle-label">Job management</span>
          <h2>Edit, pause, close, or publish</h2>
        </div>
        <span className="status-pill status-progress">{job.status}</span>
      </div>

      <div className="field-grid">
        <label className="field">
          <span>Role title</span>
          <input value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>
        <label className="field">
          <span>Location</span>
          <input value={location} onChange={(event) => setLocation(event.target.value)} />
        </label>
      </div>

      <label className="field">
        <span>Description</span>
        <textarea rows={10} value={description} onChange={(event) => setDescription(event.target.value)} />
      </label>

      <div className="shell-actions">
        <button className="button button-primary" disabled={isPending} onClick={() => updateJob("save")} type="button">
          Save edits
        </button>
        <button className="button button-secondary" disabled={isPending} onClick={() => updateJob("publish")} type="button">
          Publish job
        </button>
        <button className="button button-secondary" disabled={isPending} onClick={() => updateJob("pause")} type="button">
          Pause job
        </button>
        <button className="button button-secondary" disabled={isPending} onClick={() => updateJob("close")} type="button">
          Close job
        </button>
      </div>

      {!message ? null : <span className="status-pill status-approved">{message}</span>}
    </section>
  );
}
