import { createHash, randomBytes } from "node:crypto";

export function generateOpaqueToken() {
  return randomBytes(24).toString("hex");
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
