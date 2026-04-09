import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ ok: true });

  response.cookies.set("hr_access_token", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    expires: new Date(0)
  });

  response.cookies.set("hr_refresh_token", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    expires: new Date(0)
  });

  return response;
}
