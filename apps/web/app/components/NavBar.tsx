"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type SessionUser = { id: string; email: string; name: string } | null;

const navItems = [
  { href: "/", label: "🏠 Home" },
  { href: "/search", label: "🔎 Search" },
  { href: "/deals", label: "🎁 Deals" },
  { href: "/pricing", label: "🧾 Pricing" },
  { href: "/bookings", label: "🎫 My Bookings" },
];

export default function NavBar() {
  const pathname = usePathname();
  const [user, setUser] = useState<SessionUser>(null);

  useEffect(() => {
    let ignore = false;

    async function readSession() {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!res.ok) {
          if (!ignore) setUser(null);
          return;
        }
        const data = await res.json();
        if (!ignore) setUser(data.user ?? null);
      } catch {
        if (!ignore) setUser(null);
      }
    }

    readSession();
    return () => {
      ignore = true;
    };
  }, [pathname]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-20 border-b border-orange-100/70 bg-white/70 shadow-[0_6px_25px_rgba(15,23,42,0.06)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="group flex items-center gap-2">
          <span className="rounded-xl bg-gradient-to-br from-orange-500 via-red-500 to-teal-500 px-2 py-1 text-xs font-black text-white transition group-hover:scale-105">
            TZ
          </span>
          <span className="gradient-text text-base font-extrabold tracking-tight">Tripzy</span>
        </Link>

        <nav className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-full border border-orange-100/70 bg-white/90 p-1 shadow-sm">
          {navItems.map((it) => {
            const active = pathname === it.href;
            return (
              <Link
                key={it.href}
                href={it.href}
                className={
                  "rounded-full px-3 py-1 text-sm font-semibold transition " +
                  (active
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow"
                    : "text-slate-600 hover:bg-orange-50 hover:text-orange-700")
                }
              >
                {it.label}
              </Link>
            );
          })}
          </div>
          {user ? (
            <button
              type="button"
              onClick={logout}
              className="chip"
              title={`Signed in as ${user.email}`}
            >
              👋 {user.name.split(" ")[0]} - Logout
            </button>
          ) : (
            <Link href="/auth" className="chip">
              🔐 Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

