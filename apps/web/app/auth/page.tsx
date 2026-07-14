'use client';

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";

import ErrorBanner from "../components/ErrorBanner";
import Spinner from "../components/Spinner";

type AuthMode = "login" | "signup";

export default function AuthPage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-2xl px-4 py-10"><div className="panel p-6"><Spinner label="Loading" /></div></main>}>
      <AuthPageContent />
    </Suspense>
  );
}

function AuthPageContent() {
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/search";

  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [verifyEmail, setVerifyEmail] = useState("");
  const [verifyToken, setVerifyToken] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const endpoint = useMemo(() => {
    return mode === "signup" ? "/api/auth/signup" : "/api/auth/login";
  }, [mode]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setMessage(null);
    setFieldErrors({});

    try {
      const payload: Record<string, string> = { email, password };
      if (mode === "signup") payload.name = name;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFieldErrors(data?.fieldErrors ?? {});
        setError(data?.message ?? "Could not authenticate user.");
        return;
      }

      if (mode === "signup") {
        const preview = data?.verification_token_preview ? ` Token: ${data.verification_token_preview}` : "";
        setMessage(`Account created. Verify your email before login.${preview}`);
      } else {
        setMessage("Signed in. Redirecting...");
        window.location.href = nextPath;
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function requestVerify() {
    setError(null);
    setMessage(null);
    const res = await fetch("/api/auth/verify-email/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: verifyEmail }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setFieldErrors(data?.fieldErrors ?? {});
      setError(data?.message ?? "Could not send verification link.");
      return;
    }
    const preview = data?.verification_token_preview ? ` Token: ${data.verification_token_preview}` : "";
    setMessage(`${data?.message ?? "Verification requested."}${preview}`);
  }

  async function confirmVerify() {
    setError(null);
    setMessage(null);
    const res = await fetch("/api/auth/verify-email/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: verifyToken }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setFieldErrors(data?.fieldErrors ?? {});
      setError(data?.message ?? "Could not verify email.");
      return;
    }
    setMessage(data?.message ?? "Email verified.");
  }

  async function requestReset() {
    setError(null);
    setMessage(null);
    const res = await fetch("/api/auth/password-reset/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: resetEmail }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setFieldErrors(data?.fieldErrors ?? {});
      setError(data?.message ?? "Could not request reset.");
      return;
    }
    const preview = data?.reset_token_preview ? ` Token: ${data.reset_token_preview}` : "";
    setMessage(`${data?.message ?? "Password reset requested."}${preview}`);
  }

  async function confirmReset() {
    setError(null);
    setMessage(null);
    const res = await fetch("/api/auth/password-reset/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: resetToken, newPassword }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setFieldErrors(data?.fieldErrors ?? {});
      setError(data?.message ?? "Could not reset password.");
      return;
    }
    setMessage(data?.message ?? "Password reset successful.");
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-4">
        <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50">
          ← Back to Home
        </Link>
      </div>

      <div className="panel p-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Sign in to Tripzy</h1>
        <p className="mt-2 text-sm text-slate-600">
          Secure session login with protected booking and masked payment/ID details.
        </p>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={mode === "login" ? "btn-primary px-4 py-2 text-sm" : "btn-secondary px-4 py-2 text-sm"}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={mode === "signup" ? "btn-primary px-4 py-2 text-sm" : "btn-secondary px-4 py-2 text-sm"}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={submit} className="mt-5 grid grid-cols-1 gap-4">
          {mode === "signup" ? (
            <label className="block">
              <span className="mb-1 block text-sm font-semibold">Full name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-orange-100 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400"
                required
              />
              {fieldErrors.name ? <div className="mt-1 text-xs font-semibold text-rose-700">{fieldErrors.name}</div> : null}
            </label>
          ) : null}

          <label className="block">
            <span className="mb-1 block text-sm font-semibold">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-orange-100 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400"
              required
            />
            {fieldErrors.email ? <div className="mt-1 text-xs font-semibold text-rose-700">{fieldErrors.email}</div> : null}
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-orange-100 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400"
              required
              minLength={8}
            />
            {fieldErrors.password ? <div className="mt-1 text-xs font-semibold text-rose-700">{fieldErrors.password}</div> : null}
          </label>

          {error ? <ErrorBanner message={error} /> : null}
          {message ? <div className="rounded-xl bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800">{message}</div> : null}

          <button type="submit" className="btn-primary px-4 py-2 text-sm" disabled={submitting}>
            {submitting ? <Spinner label="Please wait" /> : mode === "signup" ? "Create account" : "Login"}
          </button>
        </form>

        <p className="mt-4 text-xs text-slate-500">
          By continuing, you agree to secure cookie-based session handling for authentication.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-orange-100 p-3">
            <div className="text-sm font-bold text-slate-900">Email verification</div>
            <input
              placeholder="Email"
              value={verifyEmail}
              onChange={(e) => setVerifyEmail(e.target.value)}
              className="mt-2 w-full rounded-xl border border-orange-100 px-3 py-2 text-sm"
            />
            <button type="button" onClick={requestVerify} className="btn-secondary mt-2 px-3 py-2 text-xs">
              Send verify link
            </button>

            <input
              placeholder="Verification token"
              value={verifyToken}
              onChange={(e) => setVerifyToken(e.target.value)}
              className="mt-3 w-full rounded-xl border border-orange-100 px-3 py-2 text-sm"
            />
            <button type="button" onClick={confirmVerify} className="btn-secondary mt-2 px-3 py-2 text-xs">
              Confirm token
            </button>
          </div>

          <div className="rounded-xl border border-orange-100 p-3">
            <div className="text-sm font-bold text-slate-900">Password reset</div>
            <input
              placeholder="Email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className="mt-2 w-full rounded-xl border border-orange-100 px-3 py-2 text-sm"
            />
            <button type="button" onClick={requestReset} className="btn-secondary mt-2 px-3 py-2 text-xs">
              Send reset link
            </button>

            <input
              placeholder="Reset token"
              value={resetToken}
              onChange={(e) => setResetToken(e.target.value)}
              className="mt-3 w-full rounded-xl border border-orange-100 px-3 py-2 text-sm"
            />
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-2 w-full rounded-xl border border-orange-100 px-3 py-2 text-sm"
            />
            {fieldErrors.newPassword ? <div className="mt-1 text-xs font-semibold text-rose-700">{fieldErrors.newPassword}</div> : null}
            {fieldErrors.token ? <div className="mt-1 text-xs font-semibold text-rose-700">{fieldErrors.token}</div> : null}
            <button type="button" onClick={confirmReset} className="btn-secondary mt-2 px-3 py-2 text-xs">
              Update password
            </button>
          </div>
        </div>

      </div>
    </main>
  );
}
