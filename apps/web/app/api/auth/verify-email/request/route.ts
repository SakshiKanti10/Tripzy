import { NextResponse } from "next/server";

import { prisma } from "../../../../lib/server/prisma";
import { checkRateLimit, getRequestIdentifier } from "../../../../lib/server/rateLimit";
import { generateOpaqueToken, hashToken } from "../../../../lib/server/tokens";
import { emailOnlySchema, zodFieldErrors } from "../../../../lib/validation";
import { localCreateVerificationToken, localFindUserByEmail } from "../../../../lib/server/localAuthStore";

export async function POST(req: Request) {
  try {
    const allowed = await checkRateLimit({
      action: "auth.verify.request",
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
    let user: { id: string; email: string; emailVerified: boolean } | null = null;

    try {
      const dbUser = await prisma.user.findUnique({ where: { email } });
      if (dbUser) {
        user = { id: dbUser.id, email: dbUser.email, emailVerified: dbUser.emailVerified };
      }
    } catch {
      const localUser = localFindUserByEmail(email);
      if (localUser) {
        user = { id: localUser.id, email: localUser.email, emailVerified: localUser.emailVerified };
      }
    }

    if (user && !user.emailVerified) {
      const token = generateOpaqueToken();
      try {
        await prisma.verificationToken.create({
          data: {
            userId: user.id,
            tokenHash: hashToken(token),
            expiresAt: new Date(Date.now() + 30 * 60 * 1000),
          },
        });
      } catch {
        localCreateVerificationToken(user.id, hashToken(token), 30 * 60 * 1000);
      }

      if (process.env.NODE_ENV !== "production") {
        console.log(`[Tripzy] Verify email token for ${user.email}: ${token}`);
      }

      return NextResponse.json({
        message: "Verification email has been sent.",
        ...(process.env.NODE_ENV !== "production" ? { verification_token_preview: token } : {}),
      });
    }

    return NextResponse.json({ message: "If an account exists, verification email has been sent." });
  } catch {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  }
}
