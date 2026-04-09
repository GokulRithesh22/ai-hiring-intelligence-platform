import { NextResponse } from "next/server";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  if (!apiBaseUrl) {
    return NextResponse.json({ error: "Backend API is not configured" }, { status: 500 });
  }

  const { jobId } = await params;
  const formData = await request.formData();
  const response = await fetch(`${apiBaseUrl}/public/jobs/${jobId}/apply`, {
    method: "POST",
    body: formData,
    cache: "no-store"
  });

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return NextResponse.json(await response.json(), { status: response.status });
  }

  return NextResponse.json(
    {
      error: response.ok ? null : "Application submit failed."
    },
    { status: response.status }
  );
}
