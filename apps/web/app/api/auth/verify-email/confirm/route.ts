import { NextResponse } from "next/server";

import { prisma } from "../../../../lib/server/prisma";
import { checkRateLimit, getRequestIdentifier } from "../../../../lib/server/rateLimit";
import { hashToken } from "../../../../lib/server/tokens";
import { tokenSchema, zodFieldErrors } from "../../../../lib/validation";
import { localConsumeVerificationToken } from "../../../../lib/server/localAuthStore";

export async function POST(req: Request) {
  try {
    const allowed = await checkRateLimit({
      action: "auth.verify.confirm",
      identifier: getRequestIdentifier(req),
      maxAttempts: 12,
      windowMs: 10 * 60 * 1000,
    });
    if (!allowed.allowed) {
      return NextResponse.json({ message: "Too many attempts. Try again later." }, { status: 429 });
    }

    const body = await req.json();
    const parsed = tokenSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Please fix the highlighted fields.", fieldErrors: zodFieldErrors(parsed) },
        { status: 400 },
      );
    }

    const tokenHash = hashToken(parsed.data.token);
    try {
      const tokenRow = await prisma.verificationToken.findUnique({
        where: { tokenHash },
        include: { user: true },
      });

      if (!tokenRow || tokenRow.consumedAt || tokenRow.expiresAt < new Date()) {
        return NextResponse.json({ message: "Verification token is invalid or expired." }, { status: 400 });
      }

      await prisma.$transaction([
        prisma.user.update({
          where: { id: tokenRow.userId },
          data: { emailVerified: true, emailVerifiedAt: new Date() },
        }),
        prisma.verificationToken.update({
          where: { id: tokenRow.id },
          data: { consumedAt: new Date() },
        }),
      ]);
    } catch {
      const user = localConsumeVerificationToken(tokenHash);
      if (!user) {
        return NextResponse.json({ message: "Verification token is invalid or expired." }, { status: 400 });
      }
    }

    return NextResponse.json({ message: "Email verified successfully. You can now log in." });
  } catch {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  }
}
