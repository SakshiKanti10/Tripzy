import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { SESSION_COOKIE } from "./constants";

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const SESSION_SECRET =
  process.env.SESSION_SECRET ?? "tripzy_dev_session_secret_change_in_production";

type SessionPayload = {
  uid: string;
  email: string;
  name: string;
  exp: number;
};

function base64UrlEncode(input: string) {
  return Buffer.from(input, "utf8").toString("base64url");
}

function base64UrlDecode(input: string) {
  return Buffer.from(input, "base64url").toString("utf8");
}

function sign(payloadPart: string) {
  return createHmac("sha256", SESSION_SECRET).update(payloadPart).digest("base64url");
}

export function createSessionToken(user: { id: string; email: string; name: string }) {
  const payload: SessionPayload = {
    uid: user.id,
    email: user.email,
    name: user.name,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };

  const payloadPart = base64UrlEncode(JSON.stringify(payload));
  const signature = sign(payloadPart);
  return `${payloadPart}.${signature}`;
}

export function readSessionToken(token: string | undefined): SessionPayload | null {
  if (!token) return null;

  const [payloadPart, signature] = token.split(".");
  if (!payloadPart || !signature) return null;

  const expectedSignature = sign(payloadPart);

  const expectedBuffer = Buffer.from(expectedSignature, "utf8");
  const providedBuffer = Buffer.from(signature, "utf8");
  if (expectedBuffer.length !== providedBuffer.length) return null;
  if (!timingSafeEqual(expectedBuffer, providedBuffer)) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(payloadPart)) as SessionPayload;
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    if (!payload.uid || !payload.email || !payload.name) return null;
    return payload;
  } catch {
    return null;
  }
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, saltedHash: string) {
  const [salt, originalHash] = saltedHash.split(":");
  if (!salt || !originalHash) return false;

  const derivedHash = scryptSync(password, salt, 64).toString("hex");
  const originalBuffer = Buffer.from(originalHash, "hex");
  const derivedBuffer = Buffer.from(derivedHash, "hex");

  if (originalBuffer.length !== derivedBuffer.length) return false;
  return timingSafeEqual(originalBuffer, derivedBuffer);
}
