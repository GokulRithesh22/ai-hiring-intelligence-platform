"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function CandidateLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push("/jobs");
  };

  return (
    <form className="wf-stack" onSubmit={handleSubmit}>
      <div>
        <label className="wf-label" htmlFor="candidate-email">
          Email
        </label>
        <input
          className="wf-input"
          id="candidate-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>

      <button className="wf-button" type="submit">
        Send OTP
      </button>

      <div className="wf-divider">OR</div>

      <button
        className="wf-button"
        type="button"
        onClick={() => {
          router.push("/jobs");
        }}
      >
        Google Login
      </button>
    </form>
  );
}
