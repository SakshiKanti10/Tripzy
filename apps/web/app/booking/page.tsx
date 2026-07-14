'use client';

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";

import ErrorBanner from "../components/ErrorBanner";
import Spinner from "../components/Spinner";
import { formatINR } from "../lib/tripzyApi";
import type { BookingRecord, BookingRequest, TravelType } from "../lib/types";

type PaymentMethod = "card";

function todayISO() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function BookingPage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-5xl px-4 py-8"><div className="panel p-6"><Spinner label="Loading booking" /></div></main>}>
      <BookingPageContent />
    </Suspense>
  );
}

function BookingPageContent() {
  const sp = useSearchParams();

  const trip = useMemo(() => {
    return {
      from_city: sp.get("from_city") ?? "Mumbai",
      to_city: sp.get("to_city") ?? "Delhi",
      travel_date: sp.get("travel_date") ?? todayISO(),
      travel_type: (sp.get("travel_type") === "train" ? "train" : "flight") as TravelType,
      platform_name: sp.get("platform_name") ?? "Trip Platform",
      final_price: Number(sp.get("final_price") ?? 0),
      passengers: Number(sp.get("passengers") ?? 1),
    };
  }, [sp]);

  const [travellerName, setTravellerName] = useState("");
  const [travellerId, setTravellerId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [paymentToken, setPaymentToken] = useState("pm_card_visa");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [confirmed, setConfirmed] = useState<BookingRecord | null>(null);

  async function bookNow(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    const payload: BookingRequest = {
      ...trip,
      traveller_name: travellerName,
      traveller_id: travellerId,
      payment_method: paymentMethod,
      payment_token: paymentToken,
    };

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFieldErrors(data?.fieldErrors ?? {});
        setError(data?.message ?? "Could not complete booking.");
        return;
      }

      setConfirmed(data.booking as BookingRecord);
    } catch {
      setError("Network error while booking.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-4">
        <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50">
          ← Back to Home
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Secure Booking</h1>
        <p className="mt-2 text-sm text-slate-600">
          Complete your booking quickly. Payment and ID values are masked before storage.
        </p>
      </div>

      {confirmed ? (
        <section className="panel p-6">
          <div className="rounded-xl bg-teal-50 p-4 text-teal-900">
            <div className="text-sm font-bold">Booking confirmed</div>
            <div className="mt-1 text-xs">Reference: {confirmed.booking_ref}</div>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
            <div className="panel-solid p-3">Route: {confirmed.from_city} to {confirmed.to_city}</div>
            <div className="panel-solid p-3">Date: {confirmed.travel_date}</div>
            <div className="panel-solid p-3">Traveller ID: {confirmed.masked_traveller_id}</div>
            <div className="panel-solid p-3">Payment: {confirmed.masked_payment_value}</div>
          </div>
          <Link href="/bookings" className="btn-primary mt-5 inline-block px-4 py-2 text-sm">
            View all bookings
          </Link>
        </section>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <section className="panel md:col-span-2 p-5">
            <form onSubmit={bookNow} className="grid grid-cols-1 gap-4">
              <label>
                <span className="mb-1 block text-sm font-semibold">Traveller full name</span>
                <input
                  value={travellerName}
                  onChange={(e) => setTravellerName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-orange-100 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400"
                />
                {fieldErrors.traveller_name ? <div className="mt-1 text-xs font-semibold text-rose-700">{fieldErrors.traveller_name}</div> : null}
              </label>

              <label>
                <span className="mb-1 block text-sm font-semibold">Government ID number</span>
                <input
                  value={travellerId}
                  onChange={(e) => setTravellerId(e.target.value)}
                  required
                  minLength={6}
                  className="w-full rounded-xl border border-orange-100 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400"
                />
                {fieldErrors.traveller_id ? <div className="mt-1 text-xs font-semibold text-rose-700">{fieldErrors.traveller_id}</div> : null}
              </label>

              <div>
                <span className="mb-1 block text-sm font-semibold">Payment method</span>
                <div className="flex flex-wrap gap-2">
                  {(["card"] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      className={paymentMethod === method ? "btn-primary px-3 py-2 text-xs" : "btn-secondary px-3 py-2 text-xs"}
                      onClick={() => setPaymentMethod(method)}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <label>
                <span className="mb-1 block text-sm font-semibold">Stripe payment method token</span>
                <input
                  value={paymentToken}
                  onChange={(e) => setPaymentToken(e.target.value)}
                  required
                  minLength={4}
                  className="w-full rounded-xl border border-orange-100 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400"
                />
                <div className="mt-1 text-xs text-slate-500">Use a provider token (example test token: pm_card_visa). Raw card data never hits Tripzy server.</div>
                {fieldErrors.payment_token ? <div className="mt-1 text-xs font-semibold text-rose-700">{fieldErrors.payment_token}</div> : null}
              </label>

              {error ? <ErrorBanner message={error} /> : null}

              <button type="submit" disabled={submitting} className="btn-primary px-4 py-2 text-sm disabled:opacity-60">
                {submitting ? <Spinner label="Booking ticket" /> : "Confirm booking"}
              </button>
            </form>
          </section>

          <aside className="panel-solid p-5">
            <div className="text-sm font-extrabold text-slate-900">Trip summary</div>
            <div className="mt-3 space-y-2 text-sm text-slate-700">
              <div>{trip.from_city} to {trip.to_city}</div>
              <div>{trip.travel_type} on {trip.travel_date}</div>
              <div>Platform: {trip.platform_name}</div>
              <div>Passengers: {trip.passengers}</div>
              <div className="text-base font-extrabold text-slate-900">Total: {formatINR(trip.final_price)}</div>
            </div>
            <div className="mt-4 rounded-xl bg-orange-50 p-3 text-xs text-slate-700">
              Sensitive details are masked in storage and never returned in full after booking.
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
