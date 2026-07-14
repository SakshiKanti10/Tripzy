export const dynamic = 'force-dynamic';
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { SESSION_COOKIE } from "../../../lib/server/constants";

export async function POST() {
  cookies().set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });

  return NextResponse.json({ ok: true });
}
