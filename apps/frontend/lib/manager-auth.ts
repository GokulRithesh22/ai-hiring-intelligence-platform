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

async function extractManagerAccessToken() {
  const cookieStore = await cookies();
  const directCookieNames = [
    "manager_access_token",
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

export async function getManagerSession() {
  if (!apiBaseUrl) {
    return null;
  }

  const accessToken = await extractManagerAccessToken();
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
    } | null;
  };

  if (!payload.user || !["MANAGER", "ADMIN"].includes(payload.user.role ?? "")) {
    return null;
  }

  return {
    accessToken
  };
}

export async function requireManagerSession(nextPath = "/manager/dashboard") {
  const session = await getManagerSession();

  if (!session) {
    redirect(`/manager/login?next=${encodeURIComponent(nextPath)}`);
  }

  return session;
}
