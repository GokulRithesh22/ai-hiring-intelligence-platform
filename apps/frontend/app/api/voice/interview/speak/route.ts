const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function POST(request: Request) {
  if (!apiBaseUrl) {
    return new Response(JSON.stringify({ error: "Backend API is not configured" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }

  const body = await request.text();
  const response = await fetch(`${apiBaseUrl}/voice/interview/speak`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body,
    cache: "no-store"
  });

  return new Response(await response.arrayBuffer(), {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("content-type") ?? "audio/mpeg"
    }
  });
}
