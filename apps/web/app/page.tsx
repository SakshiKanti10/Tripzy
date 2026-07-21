"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { TravelType } from "./lib/types";

function todayISO() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.5 },
};

export default function Home() {
  const router = useRouter();
  const [from, setFrom] = useState("Mumbai");
  const [to, setTo] = useState("Delhi");
  const [date, setDate] = useState(todayISO());
  const [passengers, setPassengers] = useState(1);
  const [type, setType] = useState<TravelType>("flight");

  const canSearch = useMemo(() => {
    return from.trim() && to.trim() && date && passengers >= 1;
  }, [from, to, date, passengers]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!canSearch) return;
    const params = new URLSearchParams({
      from_city: from.trim(),
      to_city: to.trim(),
      travel_date: date,
      travel_type: type,
      passengers: String(passengers),
    });
    router.push(`/search/results?${params.toString()}`);
  }

  return (
    <main className="relative z-10">
      {/* Hero */}
      <section className="relative overflow-hidden px-6 pt-16 pb-24 md:pt-24 md:pb-32">
        <div className="mx-auto max-w-7xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-indigo-300">
              <span className="h-2 w-2 rounded-full bg-indigo-400" />
              Compare real final prices
            </span>
            <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-extrabold leading-tight tracking-tight md:text-6xl lg:text-7xl">
              Find the cheapest{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                real final cost
              </span>{" "}
              for your trip.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300 md:text-xl">
              Tripzy compares flights and trains across platforms and shows you the true final price —
              discounts, cashback, and hidden fees included.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mx-auto mt-10 max-w-4xl"
          >
            <form
              onSubmit={handleSearch}
              className="panel grid grid-cols-1 gap-4 p-5 text-left md:grid-cols-6 md:items-end"
            >
              <label className="md:col-span-1">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400">From</span>
                <input
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  placeholder="Mumbai"
                  className="w-full rounded-xl border border-slate-600 bg-slate-800/50 px-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-400"
                />
              </label>
              <label className="md:col-span-1">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400">To</span>
                <input
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="Delhi"
                  className="w-full rounded-xl border border-slate-600 bg-slate-800/50 px-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-400"
                />
              </label>
              <label className="md:col-span-1">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400">Date</span>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-600 bg-slate-800/50 px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-400"
                />
              </label>
              <label className="md:col-span-1">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400">Passengers</span>
                <input
                  type="number"
                  min={1}
                  max={9}
                  value={passengers}
                  onChange={(e) => setPassengers(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-600 bg-slate-800/50 px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-400"
                />
              </label>
              <label className="md:col-span-1">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400">Type</span>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as TravelType)}
                  className="w-full rounded-xl border border-slate-600 bg-slate-800/50 px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-400"
                >
                  <option value="flight">Flight</option>
                  <option value="train">Train</option>
                </select>
              </label>
              <button
                type="submit"
                disabled={!canSearch}
                className="btn-primary h-fit px-4 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60 md:col-span-1"
              >
                Search trips
              </button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400"
          >
            <span>Popular:</span>
            {["Mumbai → Delhi", "Bengaluru → Goa", "Pune → Jaipur"].map((route) => (
              <button
                key={route}
                type="button"
                onClick={() => {
                  const [f, t] = route.split(" → ");
                  setFrom(f);
                  setTo(t);
                }}
                className="chip"
              >
                {route}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <motion.div {...fadeInUp} className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">How Tripzy works</h2>
            <p className="mt-4 text-slate-400">Three simple steps to the cheapest real final price.</p>
          </motion.div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Enter your trip",
                desc: "Tell us where you're going, when, and how many travelers.",
              },
              {
                step: "02",
                title: "Compare final prices",
                desc: "We aggregate offers from top platforms and reveal the true cost after discounts & cashback.",
              },
              {
                step: "03",
                title: "Book with confidence",
                desc: "Pick the best deal and complete your booking with masked, secure payment details.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                {...fadeInUp}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="panel p-6"
              >
                <div className="text-4xl font-extrabold text-indigo-400/40">{item.step}</div>
                <h3 className="mt-4 text-xl font-bold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <motion.div {...fadeInUp} className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">Why travelers love Tripzy</h2>
            <p className="mt-4 text-slate-400">We cut through the noise so you see what you&apos;ll actually pay.</p>
          </motion.div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "True final cost",
                desc: "Taxes, fees, discounts, and cashback all calculated upfront.",
                icon: (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                ),
              },
              {
                title: "Multi-platform compare",
                desc: "See offers from MakeMyTrip, Goibibo, Ixigo, EaseMyTrip, Yatra, and more.",
                icon: (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                ),
              },
              {
                title: "No hidden fees",
                desc: "We surface every charge before you click 'book' so there are no surprises.",
                icon: (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                ),
              },
              {
                title: "Secure bookings",
                desc: "Your ID and payment details are masked and stored with bank-grade security.",
                icon: (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                ),
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                {...fadeInUp}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="panel p-6"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-300">
                  {feature.icon}
                </div>
                <h3 className="mt-4 text-lg font-bold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <motion.div {...fadeInUp} className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">Trusted by travelers</h2>
            <p className="mt-4 text-slate-400">See why thousands use Tripzy to plan their trips.</p>
          </motion.div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                quote: "I saved ₹1,200 on my Mumbai-Delhi flight because Tripzy showed the real final price including cashback.",
                author: "Rohan Mehta",
                role: "Frequent flyer",
              },
              {
                quote: "No more clicking through five apps. One search and I can see every platform's actual cost.",
                author: "Priya Sharma",
                role: "Solo traveler",
              },
              {
                quote: "The booking process is smooth and I love that my payment details are masked.",
                author: "Arjun Nair",
                role: "Business traveler",
              },
            ].map((t, i) => (
              <motion.div
                key={t.author}
                {...fadeInUp}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="panel p-6"
              >
                <div className="text-indigo-400">
                  <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-300">{t.quote}</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/20 text-sm font-bold text-indigo-300">
                    {t.author.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <div className="text-sm font-bold">{t.author}</div>
                    <div className="text-xs text-slate-500">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20">
        <motion.div
          {...fadeInUp}
          className="mx-auto max-w-5xl rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-700 px-6 py-16 text-center shadow-2xl"
        >
          <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
            Ready to stop overpaying for travel?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-indigo-100">
            Join thousands of travelers who compare real final prices on Tripzy.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/auth?mode=signup" className="rounded-full bg-white px-6 py-3 text-sm font-bold text-indigo-700 transition hover:bg-indigo-50">
              Create free account
            </Link>
            <Link href="/search" className="rounded-full border border-white/30 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10">
              Search without account
            </Link>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
