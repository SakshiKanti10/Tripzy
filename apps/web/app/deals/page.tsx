'use client';

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

import type { DealsResponse, Offer } from "../lib/types";
import { formatINR } from "../lib/tripzyApi";

import Spinner from "../components/Spinner";
import ErrorBanner from "../components/ErrorBanner";

function finalFromParts(offer: Offer) {
  return formatINR(offer.final_price);
}

function buildMockOffers(): Offer[] {
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

  // 5 options (realistic platform names)
  return [
    mk("MakeMyTrip", 5200, 200, 100),
    mk("Goibibo", 5100, 150, 250),
    mk("EaseMyTrip", 5300, 300, 0),
    mk("Ixigo", 4950, 100, 50),
    mk("Yatra", 5000, 250, 0),
  ];
}

export default function DealsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DealsResponse | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setError(null);
      try {
        // Frontend-only for MVP.
        const mockDeals: DealsResponse = {
          title: "Latest travel offers",
          items: buildMockOffers(),
        };
        if (!cancelled) setData(mockDeals);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Failed to load deals");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
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
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Deals</h1>
        <p className="mt-2 text-sm text-slate-600">
          Latest travel offers from Tripzy (mock data for MVP).
        </p>
      </div>

      {error ? (
        <ErrorBanner message={error} />
      ) : loading || !data ? (
        <div className="panel p-6">
          <Spinner label="Loading deals" />
        </div>
      ) : (
        <>
          <div className="panel mb-4 p-5">
            <div className="text-sm font-bold">{data.title}</div>
            <div className="mt-1 text-xs text-slate-600">Prices are mock data right now.</div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {data.items.map((offer, idx) => (
              <motion.div
                key={offer.platform_name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.07 }}
                className="panel-solid p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-base font-extrabold">{offer.platform_name}</div>
                    <div className="mt-1 text-xs text-slate-600">Price: {formatINR(offer.price)}</div>
                    <div className="mt-1 text-xs text-slate-600">Discount: {formatINR(offer.discount)}</div>
                    <div className="mt-1 text-xs text-slate-600">Cashback: {formatINR(offer.cashback)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-extrabold">{finalFromParts(offer)}</div>
                    <div className="text-xs text-slate-600">Final</div>
                  </div>
                </div>

                <Link
                  href={`/booking?platform_name=${encodeURIComponent(offer.platform_name)}&final_price=${offer.final_price}`}
                  className="btn-primary mt-4 block px-4 py-2 text-center text-sm"
                >
                  Book offer
                </Link>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}

