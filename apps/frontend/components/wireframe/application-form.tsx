"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";

import { submitCandidateApplication } from "@/lib/api-adapters";

type ApplicationFormProps = {
  jobId: string;
};

function encodeQuestions(questions: string[]) {
  return encodeURIComponent(JSON.stringify(questions));
}

export function ApplicationForm({ jobId }: ApplicationFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [experience, setExperience] = useState("");
  const [currentCtc, setCurrentCtc] = useState("");
  const [expectedCtc, setExpectedCtc] = useState("");
  const [joiningDate, setJoiningDate] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    startTransition(async () => {
      try {
        setError(null);
        const result = await submitCandidateApplication({
          jobId,
          fullName: name,
          email,
          phone,
          resumeFile,
          earliestJoiningDate: joiningDate,
          expectedCtc,
          relocation: experience || currentCtc || "Not specified"
        });

        const search = new URLSearchParams({
          status: result.status,
          jobId,
          applicationId: result.applicationId,
          candidateId: result.candidateId,
          questions: encodeQuestions(result.interviewQuestions)
        });

        router.push(`/processing?${search.toString()}`);
      } catch (caughtError) {
        setError(
          caughtError instanceof Error ? caughtError.message : "Unable to submit application."
        );
      }
    });
  };

  return (
    <form className="wf-stack-lg" onSubmit={handleSubmit}>
      <div>
        <label className="wf-label" htmlFor="resume">
          Upload Resume
        </label>
        <input
          className="wf-input"
          id="resume"
          type="file"
          onChange={(event) => setResumeFile(event.target.files?.[0] ?? null)}
          required
        />
      </div>

      <div>
        <label className="wf-label" htmlFor="name">
          Name
        </label>
        <input
          className="wf-input"
          id="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
      </div>

      <div>
        <label className="wf-label" htmlFor="email">
          Email
        </label>
        <input
          className="wf-input"
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>

      <div>
        <label className="wf-label" htmlFor="phone">
          Phone
        </label>
        <input
          className="wf-input"
          id="phone"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          required
        />
      </div>

      <div>
        <label className="wf-label" htmlFor="experience">
          Experience
        </label>
        <input
          className="wf-input"
          id="experience"
          value={experience}
          onChange={(event) => setExperience(event.target.value)}
          required
        />
      </div>

      <div>
        <label className="wf-label" htmlFor="current-ctc">
          Current CTC
        </label>
        <input
          className="wf-input"
          id="current-ctc"
          value={currentCtc}
          onChange={(event) => setCurrentCtc(event.target.value)}
          required
        />
      </div>

      <div>
        <label className="wf-label" htmlFor="expected-ctc">
          Expected CTC
        </label>
        <input
          className="wf-input"
          id="expected-ctc"
          value={expectedCtc}
          onChange={(event) => setExpectedCtc(event.target.value)}
          required
        />
      </div>

      <div>
        <label className="wf-label" htmlFor="joining-date">
          Joining Date
        </label>
        <input
          className="wf-input"
          id="joining-date"
          type="date"
          value={joiningDate}
          onChange={(event) => setJoiningDate(event.target.value)}
          required
        />
      </div>

      {!error ? null : <p className="wf-text">{error}</p>}

      <button className="wf-button" type="submit" disabled={isPending}>
        {isPending ? "Submitting..." : "Submit Application"}
      </button>
    </form>
  );
}
