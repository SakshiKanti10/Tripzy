import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy - Tripzy",
  description: "Tripzy cookie policy.",
};

export default function CookiesPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="panel p-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Cookie Policy</h1>
        <p className="mt-4 text-sm text-slate-400">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-slate-300">
          <section>
            <h2 className="text-lg font-bold text-white">1. What are cookies</h2>
            <p className="mt-2">
              Cookies are small text files stored on your device that help us provide and improve our services.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white">2. How we use cookies</h2>
            <p className="mt-2">
              We use cookies to keep you signed in, remember your preferences, analyze site usage, and improve security.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white">3. Session cookies</h2>
            <p className="mt-2">
              We use secure, HTTP-only session cookies to maintain your login state. These are essential for account features.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white">4. Managing cookies</h2>
            <p className="mt-2">
              You can manage or disable cookies through your browser settings. However, disabling essential cookies
              may prevent you from using certain features.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
