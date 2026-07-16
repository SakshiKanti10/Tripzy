"use client";

import Link from "next/link";

export default function NavBar() {
  return (
    <nav className="relative z-20 flex items-center justify-between px-6 py-4">
      <Link href="/" className="text-2xl font-bold tracking-tight">
        Tripzy
      </Link>
      <div className="flex items-center gap-6">
        <Link href="/" className="text-sm font-medium hover:text-indigo-300">
          Home
        </Link>
        <Link
          href="/login"
          className="text-sm font-medium hover:text-indigo-300"
        >
          Login
        </Link>
      </div>
    </nav>
  );
}