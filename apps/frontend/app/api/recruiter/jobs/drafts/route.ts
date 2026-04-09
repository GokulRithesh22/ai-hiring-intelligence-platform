import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function POST(request: Request) {
  if (!apiBaseUrl) {
    return NextResponse.json({ error: "Backend API is not configured" }, { status: 500 });
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("recruiter_access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "Recruiter authentication required" }, { status: 401 });
  }

  const body = await request.text();
  const response = await fetch(`${apiBaseUrl}/jobs/drafts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body
  });

  return NextResponse.json(await response.json(), { status: response.status });
}
