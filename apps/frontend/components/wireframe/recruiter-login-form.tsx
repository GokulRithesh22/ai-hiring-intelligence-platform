"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function RecruiterLoginWireframe() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push("/dashboard");
  };

  return (
    <form className="wf-stack" onSubmit={handleSubmit}>
      <div>
        <label className="wf-label" htmlFor="recruiter-email">
          Email
        </label>
        <input
          className="wf-input"
          id="recruiter-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>

      <div>
        <label className="wf-label" htmlFor="recruiter-password">
          Password
        </label>
        <input
          className="wf-input"
          id="recruiter-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </div>

      <button className="wf-button" type="submit">
        Login
      </button>
    </form>
  );
}
