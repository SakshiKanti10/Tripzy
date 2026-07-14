export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";

import { prisma } from "../../../../lib/server/prisma";
import { checkRateLimit, getRequestIdentifier } from "../../../../lib/server/rateLimit";
import { generateOpaqueToken, hashToken } from "../../../../lib/server/tokens";
import { emailOnlySchema, zodFieldErrors } from "../../../../lib/validation";
import { localCreateResetToken, localFindUserByEmail } from "../../../../lib/server/localAuthStore";

export async function POST(req: Request) {
  try {
    const allowed = await checkRateLimit({
      action: "auth.reset.request",
      identifier: getRequestIdentifier(req),
      maxAttempts: 6,
      windowMs: 10 * 60 * 1000,
    });
    if (!allowed.allowed) {
      return NextResponse.json({ message: "Too many attempts. Try again later." }, { status: 429 });
    }

    const body = await req.json();
    const parsed = emailOnlySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Please fix the highlighted fields.", fieldErrors: zodFieldErrors(parsed) },
        { status: 400 },
      );
    }

    const email = parsed.data.email.toLowerCase();
    let user: { id: string; email: string } | null = null;

    try {
      const dbUser = await prisma.user.findUnique({ where: { email } });
      if (dbUser) user = { id: dbUser.id, email: dbUser.email };
    } catch {
      const localUser = localFindUserByEmail(email);
      if (localUser) user = { id: localUser.id, email: localUser.email };
    }

    if (user) {
      const token = generateOpaqueToken();
      try {
        await prisma.passwordResetToken.create({
          data: {
            userId: user.id,
            tokenHash: hashToken(token),
            expiresAt: new Date(Date.now() + 30 * 60 * 1000),
          },
        });
      } catch {
        localCreateResetToken(user.id, hashToken(token), 30 * 60 * 1000);
      }

      if (process.env.NODE_ENV !== "production") {
        console.log(`[Tripzy] Password reset token for ${user.email}: ${token}`);
      }

      return NextResponse.json({
        message: "Reset link has been sent.",
        ...(process.env.NODE_ENV !== "production" ? { reset_token_preview: token } : {}),
      });
    }

    return NextResponse.json({ message: "If an account exists, reset link has been sent." });
  } catch {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  }
}
