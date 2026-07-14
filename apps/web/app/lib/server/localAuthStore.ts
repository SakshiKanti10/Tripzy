import fs from "node:fs";
import path from "node:path";

import { hashPassword, verifyPassword } from "./auth";

type LocalUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  emailVerified: boolean;
  emailVerifiedAt?: string;
  createdAt: string;
};

type LocalToken = {
  userId: string;
  expiresAt: number;
  consumedAt?: number;
};

type LocalStore = {
  users: LocalUser[];
  verificationByHash: Record<string, LocalToken>;
  passwordResetByHash: Record<string, LocalToken>;
};

const STORE_FILE = path.join(process.cwd(), ".tripzy-local-auth.json");

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function readStore(): LocalStore {
  try {
    if (!fs.existsSync(STORE_FILE)) {
      return { users: [], verificationByHash: {}, passwordResetByHash: {} };
    }

    const raw = fs.readFileSync(STORE_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<LocalStore>;

    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      verificationByHash: parsed.verificationByHash ?? {},
      passwordResetByHash: parsed.passwordResetByHash ?? {},
    };
  } catch {
    return { users: [], verificationByHash: {}, passwordResetByHash: {} };
  }
}

function writeStore(store: LocalStore) {
  const dir = path.dirname(STORE_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), "utf8");
}

function findUserByEmail(store: LocalStore, email: string) {
  const normalized = normalizeEmail(email);
  return store.users.find((u) => normalizeEmail(u.email) === normalized) ?? null;
}

function findUserById(store: LocalStore, id: string) {
  return store.users.find((u) => u.id === id) ?? null;
}

export function localCreateUser(input: { name: string; email: string; password: string }) {
  const store = readStore();
  const email = normalizeEmail(input.email);
  if (findUserByEmail(store, email)) return null;

  const user: LocalUser = {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    email,
    passwordHash: hashPassword(input.password),
    emailVerified: false,
    createdAt: new Date().toISOString(),
  };

  store.users.push(user);
  writeStore(store);
  return user;
}

export function localFindUserByEmail(email: string) {
  const store = readStore();
  return findUserByEmail(store, email);
}

export function localFindUserById(id: string) {
  const store = readStore();
  return findUserById(store, id);
}

export function localAuthenticate(email: string, password: string) {
  const store = readStore();
  const user = findUserByEmail(store, email);
  if (!user) return null;
  return verifyPassword(password, user.passwordHash) ? user : null;
}

export function localCreateVerificationToken(userId: string, tokenHash: string, ttlMs: number) {
  const store = readStore();
  store.verificationByHash[tokenHash] = {
    userId,
    expiresAt: Date.now() + ttlMs,
  };
  writeStore(store);
}

export function localConsumeVerificationToken(tokenHash: string) {
  const store = readStore();
  const row = store.verificationByHash[tokenHash];
  if (!row || row.consumedAt || row.expiresAt < Date.now()) return null;

  row.consumedAt = Date.now();
  store.verificationByHash[tokenHash] = row;

  const user = findUserById(store, row.userId);
  if (!user) return null;

  user.emailVerified = true;
  user.emailVerifiedAt = new Date().toISOString();
  writeStore(store);

  return user;
}

export function localCreateResetToken(userId: string, tokenHash: string, ttlMs: number) {
  const store = readStore();
  store.passwordResetByHash[tokenHash] = {
    userId,
    expiresAt: Date.now() + ttlMs,
  };
  writeStore(store);
}

export function localConsumeResetToken(tokenHash: string, newPassword: string) {
  const store = readStore();
  const row = store.passwordResetByHash[tokenHash];
  if (!row || row.consumedAt || row.expiresAt < Date.now()) return null;

  row.consumedAt = Date.now();
  store.passwordResetByHash[tokenHash] = row;

  const user = findUserById(store, row.userId);
  if (!user) return null;

  user.passwordHash = hashPassword(newPassword);
  writeStore(store);

  return user;
}
