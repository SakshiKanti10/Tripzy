import Link from "next/link";

export default function Home() {
  return (
    <main className="relative z-10 flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
      <h1 className="max-w-3xl text-5xl font-extrabold leading-tight tracking-tight md:text-6xl">
        Find the cheapest real final cost for your trip.
      </h1>
      <p className="mt-6 max-w-xl text-lg text-slate-300">
        Tripzy compares travel options across platforms and shows you the true
        final price — no hidden fees.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/login"
          className="rounded-full bg-indigo-500 px-6 py-3 font-semibold text-white transition hover:bg-indigo-600"
        >
          Get Started
        </Link>
      </div>
    </main>
  );
}