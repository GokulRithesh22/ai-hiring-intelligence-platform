import { NextResponse } from "next/server";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function POST(request: Request) {
  if (!apiBaseUrl) {
    return NextResponse.json({ error: "Backend API is not configured" }, { status: 500 });
  }

  const body = await request.text();
  const response = await fetch(`${apiBaseUrl}/voice/interview/sessions/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body,
    cache: "no-store"
  });

  return NextResponse.json(await response.json(), { status: response.status });
}
