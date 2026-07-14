'use client';

import { motion } from "framer-motion";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 md:py-14">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-5xl"
      >
        <p className="mb-3 inline-flex rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
          ✨ Interview Build • Product Showcase
        </p>
        <h1 className="max-w-3xl text-3xl font-extrabold tracking-tight text-slate-900 md:text-5xl md:leading-[1.08]">
          Plan smarter journeys with <span className="gradient-text">instant fare intelligence</span>.
        </h1>
        <p className="mt-5 max-w-2xl text-sm text-slate-600 md:text-lg">
          Tripzy reveals the real final fare by combining base price, coupon, cashback, and hidden fee effects in one clean comparison view.
        </p>

        <section className="panel mt-9 p-5 md:mt-10 md:p-7">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.1em] text-blue-800">🔍 Trip Search</div>
              <div className="mt-1 text-2xl font-extrabold text-slate-900">Where are you flying next?</div>
              <div className="mt-1 text-sm text-slate-600">Use one smart search card to start your comparison journey.</div>
            </div>
            <div className="hidden md:block rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
              Fast, transparent, bookable
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-5">
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">🛫 From</label>
              <input
                defaultValue=""
                placeholder=""
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-800"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">📍 To</label>
              <input
                defaultValue=""
                placeholder=""
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-800"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">📅 Date</label>
              <input
                value="Today"
                readOnly
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-800"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link
              href="/search"
              className="btn-primary relative px-8 py-3.5 text-sm font-extrabold shadow-[0_10px_28px_rgba(30,64,175,0.35)] ring-2 ring-blue-200"
            >
              <span className="absolute -top-1.5 -right-1.5 inline-flex h-3 w-3 rounded-full bg-cyan-300 ring-2 ring-white" />
              🚀 Search Best Fare Now
            </Link>
            <Link
              href="/deals"
              className="btn-secondary relative px-6 py-3.5 text-sm font-extrabold shadow-[0_10px_24px_rgba(15,23,42,0.12)] ring-2 ring-slate-200 hover:ring-blue-200"
            >
              <span className="absolute -top-1.5 -right-1.5 inline-flex h-3 w-3 rounded-full bg-blue-200 ring-2 ring-white" />
              🎁 Browse Deals
            </Link>
          </div>
        </section>

        <section className="mt-10">
          <div className="overflow-x-auto">
            <div className="flex min-w-[660px] items-center gap-3 rounded-2xl border border-slate-200 bg-white/80 p-4">
              {[
                ["🔎", "Search", "Choose route and date"],
                ["📊", "Compare", "See true final fare"],
                ["✅", "Decide", "Book best-value option"],
              ].map(([icon, title, detail], idx) => (
                <div key={title} className="flex items-center gap-3">
                  <div className="panel-solid min-w-[180px] p-3">
                    <div className="mb-1 inline-flex rounded-full bg-slate-100 px-2 py-1 text-base">{icon}</div>
                    <div className="mt-1 text-sm font-extrabold text-slate-900">{title}</div>
                    <div className="text-xs text-slate-600">{detail}</div>
                  </div>
                  {idx < 2 ? <div className="text-xl text-blue-400">➜</div> : null}
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white/75 px-3 py-2">
          {[
            ["🧭", "5+ Platforms"],
            ["⚡", "<2s Compare"],
            ["🧾", "100% Transparent"],
            ["🎯", "Live Demo-ready"],
          ].map(([icon, label]) => (
            <div key={label} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700">
              <span>{icon}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </main>
  );
}


