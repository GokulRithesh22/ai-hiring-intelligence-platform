"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";

export function RecruiterLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const nextPath = searchParams.get("next") ?? "/dashboard";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    startTransition(async () => {
      setError(null);

      const response = await fetch("/api/recruiter/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(payload.error ?? "Unable to sign in");
        return;
      }

      router.push(nextPath);
      router.refresh();
    });
  };

  return (
    <section className="form-section card stack-lg" style={{ maxWidth: 560, margin: "72px auto" }}>
      <div className="panel-heading">
        <div>
          <span className="subtle-label">Recruiter authentication</span>
          <h2>Sign in to the recruiter workspace</h2>
          <p className="supporting-copy">
            Recruiter access now combines job creation, candidate pipeline review, and hiring
            analytics in one protected dashboard.
          </p>
        </div>
      </div>

      <form className="stack-lg" onSubmit={handleSubmit}>
        <label className="field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="recruiter@yourcompany.com"
            required
          />
        </label>

        <label className="field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            required
          />
        </label>

        {!error ? null : (
          <div className="status-pill status-stop" style={{ width: "fit-content" }}>
            {error}
          </div>
        )}

        <div className="shell-actions">
          <button className="button button-primary" type="submit" disabled={isPending}>
            {isPending ? "Signing in..." : "Sign in to recruiter workspace"}
          </button>
          <Link className="button button-secondary" href="/">
            Back to landing page
          </Link>
        </div>
      </form>
    </section>
  );
}
