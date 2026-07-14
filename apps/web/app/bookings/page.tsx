'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import Spinner from "../components/Spinner";
import ErrorBanner from "../components/ErrorBanner";
import { formatINR } from "../lib/tripzyApi";
import type { BookingRecord } from "../lib/types";

export default function BookingsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<BookingRecord[]>([]);

  useEffect(() => {
    let ignore = false;

    async function run() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/bookings", { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data?.message ?? "Could not load bookings.");
          return;
        }
        if (!ignore) setItems((data.items ?? []) as BookingRecord[]);
      } catch {
        if (!ignore) setError("Network error while loading bookings.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    run();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-4">
        <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50">
          ← Back to Home
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">My <span className="gradient-text">bookings</span></h1>
        <p className="mt-2 text-sm text-slate-600">Your secured booking history with masked payment and ID details.</p>
      </div>

      {error ? <ErrorBanner message={error} /> : null}

      {loading ? (
        <div className="panel p-6">
          <Spinner label="Loading bookings" />
        </div>
      ) : items.length === 0 ? (
        <div className="panel p-6">
          <p className="text-sm text-slate-700">No bookings yet.</p>
          <Link href="/search" className="btn-primary mt-4 inline-block px-4 py-2 text-sm">
            Search tickets
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {items.map((booking, idx) => (
            <motion.article
              key={booking.booking_ref}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="ticket-card p-4 transition hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-extrabold">{booking.from_city} to {booking.to_city}</h2>
                <span className="rounded-full bg-orange-100 px-2 py-1 text-[11px] font-bold text-orange-800">
                  {booking.travel_type}
                </span>
              </div>
              <div className="mt-2 border-t border-dashed border-orange-200 pt-2 text-xs text-slate-600">Ref: {booking.booking_ref}</div>
              <div className="mt-3 space-y-1 text-sm text-slate-700">
                <div>Platform: {booking.platform_name}</div>
                <div>Date: {booking.travel_date}</div>
                <div className="font-extrabold text-slate-900">Total: {formatINR(booking.final_price)}</div>
                <div>ID: {booking.masked_traveller_id}</div>
                <div>Payment: {booking.masked_payment_value}</div>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </main>
  );
}
