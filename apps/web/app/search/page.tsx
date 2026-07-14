'use client';

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import Spinner from "../components/Spinner";
import ErrorBanner from "../components/ErrorBanner";
import type { TravelType } from "../lib/types";

type SearchFormState = {
  from_city: string;

  to_city: string;
  travel_date: string; // YYYY-MM-DD
  travel_type: TravelType;
  passengers: number;
};

function todayISO() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function SearchPage() {
  const router = useRouter();

  const [form, setForm] = useState<SearchFormState>({
    from_city: "Mumbai",
    to_city: "Delhi",
    travel_date: todayISO(),
    travel_type: "flight",
    passengers: 1,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function swapCities() {
    setForm((f) => ({ ...f, from_city: f.to_city, to_city: f.from_city }));
  }

  const canSubmit = useMemo(() => {
    return (
      form.from_city.trim().length > 0 &&
      form.to_city.trim().length > 0 &&
      form.travel_date.trim().length > 0 &&
      form.passengers >= 1
    );
  }, [form]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!canSubmit) {
      setError("Please fill all required fields.");
      return;
    }

    // Navigate with query params; results page will fetch.
    const params = new URLSearchParams({
      from_city: form.from_city.trim(),
      to_city: form.to_city.trim(),
      travel_date: form.travel_date,
      travel_type: form.travel_type,
      passengers: String(form.passengers),
    });

    setSubmitting(true);
    try {
      router.push(`/search/results?${params.toString()}`);
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
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Search trips</h1>
        <p className="mt-2 text-sm text-slate-600">
          Compare mock tickets across platforms and find the best deal.
        </p>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        onSubmit={onSubmit}
        className="panel p-5"
      >
        <div className="mb-4 flex flex-wrap gap-2">
          {["Mumbai -> Delhi", "Bengaluru -> Goa", "Pune -> Jaipur"].map((preset) => {
            const [from, to] = preset.split(" -> ");
            return (
              <button
                key={preset}
                type="button"
                onClick={() => setForm((f) => ({ ...f, from_city: from, to_city: to }))}
                className="chip"
              >
                {preset}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-semibold">From</span>
            <input
              className="w-full rounded-xl border border-orange-100 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400"
              value={form.from_city}
              onChange={(e) => setForm((f) => ({ ...f, from_city: e.target.value }))}
              placeholder="City"
              required
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold">To</span>
            <input
              className="w-full rounded-xl border border-orange-100 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400"
              value={form.to_city}
              onChange={(e) => setForm((f) => ({ ...f, to_city: e.target.value }))}
              placeholder="City"
              required
            />
          </label>

          <button
            type="button"
            onClick={swapCities}
            className="btn-secondary md:col-span-2 w-fit px-3 py-2 text-xs"
          >
            Swap route
          </button>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold">Travel date</span>
            <input
              type="date"
              className="w-full rounded-xl border border-orange-100 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400"
              value={form.travel_date}
              onChange={(e) => setForm((f) => ({ ...f, travel_date: e.target.value }))}
              required
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold">Passengers</span>
            <input
              type="number"
              min={1}
              max={9}
              className="w-full rounded-xl border border-orange-100 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400"
              value={form.passengers}
              onChange={(e) => setForm((f) => ({ ...f, passengers: Number(e.target.value) }))}
              required
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-1 block text-sm font-semibold">Type</span>
            <div className="flex gap-2">
              {(["flight", "train"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, travel_type: t }))}
                  className={
                    "flex-1 rounded-xl border px-3 py-2 text-sm font-semibold transition " +
                    (form.travel_type === t
                      ? "border-orange-300 bg-orange-100 text-orange-800"
                      : "border-orange-100 bg-white text-slate-700 hover:bg-orange-50")
                  }
                >
                  {t === "flight" ? "Flight" : "Train"}
                </button>
              ))}
            </div>
          </label>
        </div>

        {error ? (
          <div className="mt-4">
            <ErrorBanner message={error} />
          </div>
        ) : null}

        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className="btn-primary px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? <Spinner label="Loading" /> : "Search"}
          </button>
        </div>
      </motion.form>
    </main>
  );
}

