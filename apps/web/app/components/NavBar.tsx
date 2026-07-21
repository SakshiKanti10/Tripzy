"use client";

import Link from "next/link";
import { useState } from "react";

export default function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="relative z-20 border-b border-slate-800/40 bg-slate-900/30 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-2xl font-bold tracking-tight">
          Tripzy
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 md:flex">
          <Link href="/search" className="text-sm font-medium text-slate-300 transition hover:text-indigo-300">
            Search
          </Link>
          <Link href="/deals" className="text-sm font-medium text-slate-300 transition hover:text-indigo-300">
            Deals
          </Link>
          <Link href="/pricing" className="text-sm font-medium text-slate-300 transition hover:text-indigo-300">
            Pricing
          </Link>
          <Link href="/bookings" className="text-sm font-medium text-slate-300 transition hover:text-indigo-300">
            My Bookings
          </Link>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="text-sm font-medium text-slate-300 transition hover:text-indigo-300"
          >
            Log in
          </Link>
          <Link
            href="/auth?mode=signup"
            className="btn-primary px-4 py-2 text-sm"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          )}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen ? (
        <div className="border-t border-slate-800/40 bg-slate-900/80 px-6 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            <Link href="/search" className="text-sm font-medium text-slate-300" onClick={() => setMobileOpen(false)}>Search</Link>
            <Link href="/deals" className="text-sm font-medium text-slate-300" onClick={() => setMobileOpen(false)}>Deals</Link>
            <Link href="/pricing" className="text-sm font-medium text-slate-300" onClick={() => setMobileOpen(false)}>Pricing</Link>
            <Link href="/bookings" className="text-sm font-medium text-slate-300" onClick={() => setMobileOpen(false)}>My Bookings</Link>
            <hr className="border-slate-700/50" />
            <Link href="/login" className="text-sm font-medium text-slate-300" onClick={() => setMobileOpen(false)}>Log in</Link>
            <Link href="/auth?mode=signup" className="btn-primary w-fit px-4 py-2 text-sm" onClick={() => setMobileOpen(false)}>Get Started</Link>
          </div>
        </div>
      ) : null}
    </nav>
  );
}
