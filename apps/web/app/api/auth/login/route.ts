export const dynamic = 'force-dynamic';
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { createSessionToken } from "../../../lib/server/auth";
import { SESSION_COOKIE } from "../../../lib/server/constants";
import { verifyPassword } from "../../../lib/server/auth";
import { prisma } from "../../../lib/server/prisma";
import { loginSchema, zodFieldErrors } from "../../../lib/validation";
import { checkRateLimit, getRequestIdentifier } from "../../../lib/server/rateLimit";
import { localAuthenticate } from "../../../lib/server/localAuthStore";

export async function POST(req: Request) {
  try {
    const allowed = await checkRateLimit({
      action: "auth.login",
      identifier: getRequestIdentifier(req),
      maxAttempts: 10,
      windowMs: 10 * 60 * 1000,
    });
    if (!allowed.allowed) {
      return NextResponse.json({ message: "Too many login attempts. Try again later." }, { status: 429 });
    }

    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Please fix the highlighted fields.", fieldErrors: zodFieldErrors(parsed) },
        { status: 400 },
      );
    }

    const { email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    let user: { id: string; email: string; name: string; emailVerified: boolean } | null = null;

    try {
      const dbUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (dbUser && verifyPassword(password, dbUser.passwordHash)) {
        user = {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          emailVerified: dbUser.emailVerified,
        };
      }
    } catch {
      const localUser = localAuthenticate(normalizedEmail, password);
      if (localUser) {
        user = {
          id: localUser.id,
          email: localUser.email,
          name: localUser.name,
          emailVerified: localUser.emailVerified,
        };
      }
    }

    if (!user) {
      return NextResponse.json({ message: "Invalid credentials." }, { status: 401 });
    }

    if (!user.emailVerified) {
      return NextResponse.json(
        { message: "Please verify your email before logging in.", needsEmailVerification: true },
        { status: 403 },
      );
    }

    const token = createSessionToken({ id: user.id, email: user.email, name: user.name });

    cookies().set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } });
  } catch {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  }
}
