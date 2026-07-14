'use client';

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

import type { Offer, SearchRequest } from "../../lib/types";
import { formatINR } from "../../lib/tripzyApi";

import Spinner from "../../components/Spinner";
import ErrorBanner from "../../components/ErrorBanner";

type SortMode = "finalAsc" | "priceAsc" | "discountDesc" | "cashbackDesc";
type FilterMode = "all" | "cashbackOnly" | "valuePicks";

function buildReasons(offer: Offer, lowestFinal: number, highestFinal: number) {
  const reasons: string[] = [];
  const effectiveSavings = offer.discount + offer.cashback;

  if (offer.final_price === lowestFinal) reasons.push("Lowest final fare in current results.");
  if (offer.cashback >= 180) reasons.push("Strong cashback benefit for repeat travelers.");
  if (offer.discount >= 250) reasons.push("High direct discount lowers upfront cost.");
  if (highestFinal - offer.final_price >= 250) reasons.push("Noticeably cheaper than expensive alternatives.");

  if (!reasons.length) {
    if (effectiveSavings >= 250) reasons.push("Balanced savings from discount and cashback.");
    else reasons.push("Stable final pricing with reasonable benefit.");
  }

  return reasons.slice(0, 2);
}

function todayISO() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function buildOffers(seed: {
  from_city: string;
  to_city: string;
  travel_date: string;
  travel_type: "flight" | "train";
}): Offer[] {
  // Deterministic-ish mock so the UI works immediately.
  const base =
    (seed.from_city.length * 37 + seed.to_city.length * 19 + seed.travel_type.length * 71 + seed.travel_date.length * 13) % 800;

  const mk = (platform_name: string, price: number, discount: number, cashback: number): Offer => {
    const final_price = Math.max(0, price - discount - cashback);
    return {
      platform_name,
      price,
      discount,
      cashback,
      final_price,
      currency: "INR",
    };
  };

  const options = [
    mk("MakeMyTrip", 4800 + base, 250 + (base % 120), 150 + (base % 80)),
    mk("Goibibo", 5050 + Math.floor(base / 2), 180 + (base % 90), 220 + (base % 60)),
    mk("EaseMyTrip", 4950 + Math.floor(base / 3), 300 + (base % 110), 0),
    mk("Ixigo", 4700 + Math.floor(base / 4), 120 + (base % 70), 200 + (base % 50)),
    mk("Yatra", 5100 + Math.floor(base / 5), 260 + (base % 100), 0),
  ];

  // Ensure at least one best deal (cheapest) by nudging one option.
  const minFinal = Math.min(...options.map((o) => o.final_price));
  const best = options.findIndex((o) => o.final_price === minFinal);
  if (best >= 0 && options[best]) {
    options[best] = {
      ...options[best],
      final_price: Math.max(0, options[best].final_price - 120),
    };
  }

  return options;
}

function parseRequestFromQuery(query: URLSearchParams): SearchRequest {
  const from_city = query.get("from_city") ?? "Mumbai";
  const to_city = query.get("to_city") ?? "Delhi";
  const travel_date = query.get("travel_date") ?? todayISO();
  const travel_type = (query.get("travel_type") as any) ?? "flight";
  const passengers = Number(query.get("passengers") ?? "1");

  return {
    from_city,
    to_city,
    travel_date,
    travel_type,
    passengers: Number.isFinite(passengers) && passengers > 0 ? passengers : 1,
  };
}

function PriceLine({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="text-xs font-semibold text-slate-600">{label}</div>
      <div className="text-xs font-bold text-slate-900">{formatINR(value)}</div>
    </div>
  );
}

function OfferCard({
  offer,
  isBest,
  rank,
  bookingHref,
  reasons,
}: {
  offer: Offer;
  isBest: boolean;
  rank: number;
  bookingHref: string;
  reasons: string[];
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.06 }}
      className={
        "rounded-2xl border p-4 shadow-sm transition hover:-translate-y-0.5 " +
        (isBest
          ? "border-orange-300 bg-orange-50"
          : "border-orange-100 bg-white")
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="text-base font-extrabold">{offer.platform_name}</div>
            {isBest ? (
              <span className="rounded-full bg-orange-200 px-2 py-0.5 text-xs font-bold text-orange-800">
                Best Deal
              </span>
            ) : null}
            {!isBest ? <span className="text-[11px] font-bold text-slate-500">#{rank + 1}</span> : null}
          </div>
          <div className="mt-2 space-y-1">
            <PriceLine label="Price" value={offer.price} />
            <PriceLine label="Discount" value={offer.discount} />
            <PriceLine label="Cashback" value={offer.cashback} />
          </div>
          <div className="mt-3 rounded-xl border border-orange-100 bg-orange-50/70 p-2">
            <div className="text-[11px] font-bold text-orange-800">Why this is a good option</div>
            <ul className="mt-1 space-y-1 text-[11px] text-slate-700">
              {reasons.map((reason) => (
                <li key={reason}>• {reason}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs font-semibold text-slate-600">Final Price</div>
          <div className="mt-1 text-xl font-extrabold text-slate-900">{formatINR(offer.final_price)}</div>
        </div>
      </div>

      <Link href={bookingHref} className="btn-primary mt-4 block px-4 py-2 text-center text-sm">
        Book this ticket
      </Link>
    </motion.div>
  );
}

export default function ResultsPage({ searchParams }: { searchParams?: Record<string, string | string[]> }) {
  // Next passes searchParams; default to client reading query params when absent.
  const query = useMemo(() => {
    const sp = new URLSearchParams();
    if (!searchParams) return sp;

    for (const [k, v] of Object.entries(searchParams)) {
      if (Array.isArray(v)) sp.set(k, v[0] ?? "");
      else sp.set(k, v);
    }
    return sp;
  }, [searchParams]);

  const request = useMemo(() => parseRequestFromQuery(query), [query]);

  const [loading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>("finalAsc");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");

  const offers = useMemo(() => {
    try {
      return buildOffers({
        from_city: request.from_city,
        to_city: request.to_city,
        travel_date: request.travel_date,
        travel_type: request.travel_type,
      });
    } catch (e: any) {
      setError(e?.message ?? "Failed to build offers");
      return [] as Offer[];
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request.from_city, request.to_city, request.travel_date, request.travel_type]);

  const summary = useMemo(() => {
    if (!offers.length) {
      return { highest_price: 0, lowest_price: 0, savings: 0, bestIdx: -1 };
    }

    const highest_price = Math.max(...offers.map((o) => o.price));
    const lowest_price = Math.min(...offers.map((o) => o.price));
    const savings = Math.max(0, highest_price - lowest_price);

    const bestIdx = offers.reduce((best, cur, idx) => (cur.final_price < offers[best].final_price ? idx : best), 0);

    return { highest_price, lowest_price, savings, bestIdx };
  }, [offers]);

  const displayedOffers = useMemo(() => {
    const avgFinal = offers.length
      ? offers.reduce((sum, o) => sum + o.final_price, 0) / offers.length
      : 0;

    let list = [...offers];

    if (filterMode === "cashbackOnly") {
      list = list.filter((o) => o.cashback > 0);
    }

    if (filterMode === "valuePicks") {
      list = list.filter((o) => o.final_price <= avgFinal || o.discount + o.cashback >= 280);
    }

    list.sort((a, b) => {
      if (sortMode === "priceAsc") return a.price - b.price;
      if (sortMode === "discountDesc") return b.discount - a.discount;
      if (sortMode === "cashbackDesc") return b.cashback - a.cashback;
      return a.final_price - b.final_price;
    });

    return list;
  }, [filterMode, offers, sortMode]);

  const explainedOffers = useMemo(() => {
    if (!displayedOffers.length) return [] as Array<{ offer: Offer; reasons: string[]; isBest: boolean }>;
    const lowestFinal = Math.min(...displayedOffers.map((o) => o.final_price));
    const highestFinal = Math.max(...displayedOffers.map((o) => o.final_price));

    return displayedOffers.map((offer) => ({
      offer,
      reasons: buildReasons(offer, lowestFinal, highestFinal),
      isBest: offer.final_price === lowestFinal,
    }));
  }, [displayedOffers]);

  const bestExplainer = explainedOffers.find((x) => x.isBest) ?? null;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-4">
        <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50">
          ← Back to Home
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Ticket Comparison</h1>
        <p className="mt-2 text-sm text-slate-600">
          {request.from_city} → {request.to_city} • {request.travel_type} • {request.travel_date}
        </p>
      </div>

      {error ? (
        <ErrorBanner message={error} />
      ) : loading ? (
        <div className="panel p-6">
          <Spinner label="Searching" />
        </div>
      ) : (
        <>
          <section className="panel mb-5 p-5">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="metric">
                <div className="text-xs font-semibold text-slate-600">Highest Price</div>
                <div className="mt-1 text-xl font-extrabold">{formatINR(summary.highest_price)}</div>
              </div>
              <div className="metric">
                <div className="text-xs font-semibold text-slate-600">Lowest Price</div>
                <div className="mt-1 text-xl font-extrabold">{formatINR(summary.lowest_price)}</div>
              </div>
              <div className="rounded-xl bg-teal-50 p-3">
                <div className="text-xs font-semibold text-teal-700">You Save</div>
                <div className="mt-1 text-xl font-extrabold text-teal-900">{formatINR(summary.savings)}</div>
              </div>
            </div>

            <div className="mt-4 text-xs text-slate-600">
              Final Price is calculated automatically: Final = Price - Discount - Cashback.
            </div>
          </section>

          <section className="panel mb-5 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-700">Sort</span>
                {[
                  ["finalAsc", "Final fare"],
                  ["priceAsc", "Base price"],
                  ["discountDesc", "Max discount"],
                  ["cashbackDesc", "Max cashback"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setSortMode(value as SortMode)}
                    className={
                      sortMode === value
                        ? "rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white"
                        : "rounded-full border border-orange-100 bg-white px-3 py-1 text-xs font-bold text-slate-700"
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-700">Filter</span>
                {[
                  ["all", "All"],
                  ["cashbackOnly", "Cashback only"],
                  ["valuePicks", "Value picks"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFilterMode(value as FilterMode)}
                    className={
                      filterMode === value
                        ? "rounded-full bg-teal-600 px-3 py-1 text-xs font-bold text-white"
                        : "rounded-full border border-teal-100 bg-white px-3 py-1 text-xs font-bold text-slate-700"
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {bestExplainer ? (
            <section className="panel mb-5 p-4">
              <div className="text-sm font-extrabold text-slate-900">
                Why {bestExplainer.offer.platform_name} is best right now
              </div>
              <ul className="mt-2 space-y-1 text-sm text-slate-700">
                {bestExplainer.reasons.map((reason) => (
                  <li key={reason}>• {reason}</li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {explainedOffers.map(({ offer, reasons, isBest }, idx) => (
              <OfferCard
                key={offer.platform_name}
                offer={offer}
                isBest={isBest}
                rank={idx}
                reasons={reasons}
                bookingHref={`/booking?from_city=${encodeURIComponent(request.from_city)}&to_city=${encodeURIComponent(
                  request.to_city,
                )}&travel_date=${encodeURIComponent(request.travel_date)}&travel_type=${encodeURIComponent(
                  request.travel_type,
                )}&passengers=${request.passengers}&platform_name=${encodeURIComponent(
                  offer.platform_name,
                )}&final_price=${offer.final_price}`}
              />
            ))}
          </section>

          {!explainedOffers.length ? (
            <div className="panel mt-4 p-4 text-sm text-slate-700">
              No deals match this filter. Try switching to <span className="font-bold">All</span>.
            </div>
          ) : null}

          <div className="mt-6 text-center text-sm text-slate-600">
            Want to search another route?{" "}
            <Link href="/search" className="font-bold text-orange-700 hover:underline">
              Search again
            </Link>
          </div>
        </>
      )}
    </main>
  );
}

