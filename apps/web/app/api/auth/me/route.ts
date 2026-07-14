export const dynamic = 'force-dynamic';

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { readSessionToken } from "../../../lib/server/auth";
import { SESSION_COOKIE } from "../../../lib/server/constants";
import { prisma } from "../../../lib/server/prisma";
import { localFindUserById } from "../../../lib/server/localAuthStore";

export async function GET() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  const payload = readSessionToken(token);

  if (!payload) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  let user: { id: string; email: string; name: string; emailVerified: boolean } | null = null;

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: payload.uid },
      select: { id: true, email: true, name: true, emailVerified: true },
    });
    if (dbUser) user = dbUser;
  } catch {
    const localUser = localFindUserById(payload.uid);
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
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      emailVerified: user.emailVerified,
    },
  });
}
