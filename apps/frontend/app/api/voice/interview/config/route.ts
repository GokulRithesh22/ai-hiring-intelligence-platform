import { NextResponse } from "next/server";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET() {
  if (!apiBaseUrl) {
    return NextResponse.json({ error: "Backend API is not configured" }, { status: 500 });
  }

  const response = await fetch(`${apiBaseUrl}/voice/interview/config`, {
    cache: "no-store"
  });

  return NextResponse.json(await response.json(), { status: response.status });
}
