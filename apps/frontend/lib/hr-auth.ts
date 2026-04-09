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

async function extractSupabaseAccessToken() {
  const cookieStore = await cookies();
  const directCookieNames = ["sb-access-token", "supabase-access-token", "hr_access_token"];

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

export async function requireHrSession() {
  if (!apiBaseUrl) {
    redirect("/");
  }

  const accessToken = await extractSupabaseAccessToken();
  if (!accessToken) {
    redirect("/");
  }

  const response = await fetch(`${apiBaseUrl}/auth/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    cache: "no-store"
  });

  if (!response.ok) {
    redirect("/");
  }

  const payload = (await response.json()) as {
    user: {
      role?: string;
    } | null;
  };

  if (!payload.user || !["HR", "ADMIN"].includes(payload.user.role ?? "")) {
    redirect("/");
  }

  return {
    accessToken
  };
}
