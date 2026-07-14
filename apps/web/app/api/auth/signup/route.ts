import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { createSessionToken } from "../../../lib/server/auth";
import { SESSION_COOKIE } from "../../../lib/server/constants";
import { hashPassword } from "../../../lib/server/auth";
import { prisma } from "../../../lib/server/prisma";
import { generateOpaqueToken, hashToken } from "../../../lib/server/tokens";
import { signupSchema, zodFieldErrors } from "../../../lib/validation";
import { checkRateLimit, getRequestIdentifier } from "../../../lib/server/rateLimit";
import { localCreateUser, localCreateVerificationToken, localFindUserByEmail } from "../../../lib/server/localAuthStore";

export async function POST(req: Request) {
  try {
    const allowed = await checkRateLimit({
      action: "auth.signup",
      identifier: getRequestIdentifier(req),
      maxAttempts: 8,
      windowMs: 10 * 60 * 1000,
    });
    if (!allowed.allowed) {
      return NextResponse.json({ message: "Too many signup attempts. Try again later." }, { status: 429 });
    }

    const body = await req.json();
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Please fix the highlighted fields.", fieldErrors: zodFieldErrors(parsed) },
        { status: 400 },
      );
    }

    const { name, email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    const verificationToken = generateOpaqueToken();
    let user: { id: string; email: string; name: string };

    try {
      const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (existing) {
        return NextResponse.json({ message: "Account already exists." }, { status: 409 });
      }

      user = await prisma.user.create({
        data: {
          name,
          email: normalizedEmail,
          passwordHash: hashPassword(password),
        },
      });

      await prisma.verificationToken.create({
        data: {
          userId: user.id,
          tokenHash: hashToken(verificationToken),
          expiresAt: new Date(Date.now() + 1000 * 60 * 30),
        },
      });
    } catch {
      const existing = localFindUserByEmail(normalizedEmail);
      if (existing) {
        return NextResponse.json({ message: "Account already exists." }, { status: 409 });
      }

      const localUser = localCreateUser({ name, email: normalizedEmail, password });
      if (!localUser) {
        return NextResponse.json({ message: "Account already exists." }, { status: 409 });
      }

      user = { id: localUser.id, email: localUser.email, name: localUser.name };
      localCreateVerificationToken(user.id, hashToken(verificationToken), 1000 * 60 * 30);
    }

    if (process.env.NODE_ENV !== "production") {
      console.log(`[Tripzy] Verify email token for ${normalizedEmail}: ${verificationToken}`);
    }

    const token = createSessionToken({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    cookies().set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name },
      message: "Account created. Verify your email before first login.",
      ...(process.env.NODE_ENV !== "production" ? { verification_token_preview: verificationToken } : {}),
    });
  } catch {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  }
}
