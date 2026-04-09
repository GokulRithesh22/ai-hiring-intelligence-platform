import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

function tryParseAccessToken(value: string): string | null {
  try {
    const parsed = JSON.parse(decodeURIComponent(value)) as
      | { access_token?: string }
      | [string | null, string | null]
      | null;

    if (!parsed) {
      return null;
    }

    if (Array.isArray(parsed)) {
      return typeof parsed[0] === "string" ? parsed[0] : null;
    }

    return typeof parsed.access_token === "string" ? parsed.access_token : null;
  } catch {
    return null;
  }
}

async function extractRecruiterAccessToken() {
  const cookieStore = await cookies();
  const directCookieNames = [
    "recruiter_access_token",
    "manager_access_token",
    "hr_access_token",
    "sb-access-token",
    "supabase-access-token"
  ];

  for (const name of directCookieNames) {
    const value = cookieStore.get(name)?.value;
    if (value) {
      return value;
    }
  }

  for (const cookie of cookieStore.getAll()) {
    if (!cookie.name.includes("auth-token")) {
      continue;
    }

    const parsedToken = tryParseAccessToken(cookie.value);
    if (parsedToken) {
      return parsedToken;
    }
  }

  return null;
}

export async function getRecruiterSession() {
  if (!apiBaseUrl) {
    return null;
  }

  const accessToken = await extractRecruiterAccessToken();
  if (!accessToken) {
    return null;
  }

  const response = await fetch(`${apiBaseUrl}/auth/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    cache: "no-store"
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as {
    user: {
      role?: string;
      id?: string;
      fullName?: string;
      email?: string;
    } | null;
  };

  if (!payload.user || !["RECRUITER", "ADMIN"].includes(payload.user.role ?? "")) {
    return null;
  }

  return {
    accessToken,
    user: payload.user
  };
}

export async function requireRecruiterSession(nextPath = "/dashboard") {
  const session = await getRecruiterSession();

  if (!session) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  return session;
}
