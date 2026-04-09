import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { HrLoginForm } from "@/components/hr/hr-login-form";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

async function hasValidHrSession() {
  if (!apiBaseUrl) {
    return false;
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("hr_access_token")?.value;

  if (!accessToken) {
    return false;
  }

  const response = await fetch(`${apiBaseUrl}/auth/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    cache: "no-store"
  });

  if (!response.ok) {
    return false;
  }

  const payload = (await response.json()) as {
    user: {
      role?: string;
    } | null;
  };

  return Boolean(payload.user && ["HR", "ADMIN"].includes(payload.user.role ?? ""));
}

export default async function HrLoginPage() {
  if (await hasValidHrSession()) {
    redirect("/hr/dashboard");
  }

  return <HrLoginForm />;
}
