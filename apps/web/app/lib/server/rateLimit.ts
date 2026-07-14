import { prisma } from "./prisma";

type RateLimitInput = {
  action: string;
  identifier: string;
  maxAttempts: number;
  windowMs: number;
};

export async function checkRateLimit(input: RateLimitInput) {
  try {
    const since = new Date(Date.now() - input.windowMs);

    const count = await prisma.rateLimitEvent.count({
      where: {
        action: input.action,
        identifier: input.identifier,
        createdAt: { gte: since },
      },
    });

    if (count >= input.maxAttempts) {
      return { allowed: false as const };
    }

    await prisma.rateLimitEvent.create({
      data: {
        action: input.action,
        identifier: input.identifier,
      },
    });
  } catch {
    // Local dev fallback: if DB is unavailable, do not block auth usage.
    return { allowed: true as const };
  }

  return { allowed: true as const };
}

export function getRequestIdentifier(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for") ?? "";
  const firstIp = forwarded.split(",")[0]?.trim();
  return firstIp || "local";
}
