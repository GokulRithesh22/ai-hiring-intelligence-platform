import { NextResponse } from "next/server";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

export async function POST(request: Request) {
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: "Supabase auth is not configured" }, { status: 500 });
  }

  const body = (await request.json()) as {
    email?: string;
    password?: string;
  };

  if (!body.email || !body.password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: supabaseAnonKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: body.email,
      password: body.password
    })
  });

  const payload = (await response.json()) as {
    access_token?: string;
    refresh_token?: string;
    error_description?: string;
    error?: string;
  };

  if (!response.ok || !payload.access_token) {
    return NextResponse.json(
      {
        error: payload.error_description ?? payload.error ?? "Login failed"
      },
      { status: 401 }
    );
  }

  const nextResponse = NextResponse.json({ ok: true });
  nextResponse.cookies.set("manager_access_token", payload.access_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/"
  });

  if (payload.refresh_token) {
    nextResponse.cookies.set("manager_refresh_token", payload.refresh_token, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/"
    });
  }

  return nextResponse;
}
