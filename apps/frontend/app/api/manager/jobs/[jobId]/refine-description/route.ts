import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function POST(
  request: Request,
  context: { params: Promise<{ jobId: string }> }
) {
  if (!apiBaseUrl) {
    return NextResponse.json({ error: "Backend API is not configured" }, { status: 500 });
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("manager_access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "Manager authentication required" }, { status: 401 });
  }

  const { jobId } = await context.params;
  const body = await request.text();
  const response = await fetch(`${apiBaseUrl}/jobs/${jobId}/manager/refine-description`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body
  });

  return NextResponse.json(await response.json(), { status: response.status });
}
