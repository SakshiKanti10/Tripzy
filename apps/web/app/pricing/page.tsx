'use client';

import { useMemo } from "react";
import Link from "next/link";
import { formatINR } from "../lib/tripzyApi";

function BreakdownRow({ label, value }: { label: string; value: number }) {
  const negative = value < 0;
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="text-sm font-semibold text-slate-700">{label}</div>
      <div
        className={
          "text-sm font-extrabold " +
          (negative ? "text-rose-700" : "text-slate-900")
        }
      >
        {formatINR(value)}
      </div>
    </div>
  );
}

export default function PricingPage() {
  const example = useMemo(() => {
    return {
      listing_price: 5200,
      coupon_off: -200,
      cashback_off: -50,
      bank_offer_off: 0,
      platform_fee: 0,
      final_price: 4950,
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
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Tripzy pricing breakdown</h1>
        <p className="mt-2 text-sm text-slate-600">
          Tripzy shows the cheapest real final cost by combining listing price + all discount components + fees.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="panel p-5">
          <div className="text-sm font-bold">How we calculate “final cost”</div>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            <li>1) Start with platform listing price</li>
            <li>2) Apply coupon / cashback / bank offers</li>
            <li>3) Add any platform fee</li>
            <li className="text-xs text-slate-600">Backend currently uses deterministic mock pricing.</li>
          </ul>

          <div className="mt-4 rounded-2xl bg-orange-50 p-4 text-xs text-slate-700">
            Tripzy does not sell tickets; it links out to the platform booking URL.
          </div>
        </div>

        <div className="panel-solid p-5">
          <div className="text-sm font-bold">Example</div>
          <div className="mt-3 space-y-3">
            <BreakdownRow label="Listing" value={example.listing_price} />
            <BreakdownRow label="Coupon" value={example.coupon_off} />
            <BreakdownRow label="Cashback" value={example.cashback_off} />
            <BreakdownRow label="Bank offer" value={example.bank_offer_off} />
            <BreakdownRow label="Platform fee" value={example.platform_fee} />

            <div className="my-2 h-px bg-orange-100" />
            <BreakdownRow label="Final cost" value={example.final_price} />
          </div>
        </div>
      </div>
    </main>
  );
}

