import { NextResponse } from "next/server";

import { hashPassword } from "../../../../lib/server/auth";
import { prisma } from "../../../../lib/server/prisma";
import { checkRateLimit, getRequestIdentifier } from "../../../../lib/server/rateLimit";
import { hashToken } from "../../../../lib/server/tokens";
import { passwordResetSchema, zodFieldErrors } from "../../../../lib/validation";
import { localConsumeResetToken } from "../../../../lib/server/localAuthStore";

export async function POST(req: Request) {
  try {
    const allowed = await checkRateLimit({
      action: "auth.reset.confirm",
      identifier: getRequestIdentifier(req),
      maxAttempts: 12,
      windowMs: 10 * 60 * 1000,
    });
    if (!allowed.allowed) {
      return NextResponse.json({ message: "Too many attempts. Try again later." }, { status: 429 });
    }

    const body = await req.json();
    const parsed = passwordResetSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Please fix the highlighted fields.", fieldErrors: zodFieldErrors(parsed) },
        { status: 400 },
      );
    }

    const tokenHash = hashToken(parsed.data.token);
    try {
      const tokenRow = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });

      if (!tokenRow || tokenRow.consumedAt || tokenRow.expiresAt < new Date()) {
        return NextResponse.json({ message: "Reset token is invalid or expired." }, { status: 400 });
      }

      await prisma.$transaction([
        prisma.user.update({
          where: { id: tokenRow.userId },
          data: { passwordHash: hashPassword(parsed.data.newPassword) },
        }),
        prisma.passwordResetToken.update({
          where: { id: tokenRow.id },
          data: { consumedAt: new Date() },
        }),
      ]);
    } catch {
      const user = localConsumeResetToken(tokenHash, parsed.data.newPassword);
      if (!user) {
        return NextResponse.json({ message: "Reset token is invalid or expired." }, { status: 400 });
      }
    }

    return NextResponse.json({ message: "Password updated successfully." });
  } catch {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  }
}
