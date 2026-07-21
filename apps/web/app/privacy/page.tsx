import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Tripzy",
  description: "Tripzy privacy policy.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="panel p-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Privacy Policy</h1>
        <p className="mt-4 text-sm text-slate-400">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-slate-300">
          <section>
            <h2 className="text-lg font-bold text-white">1. Information we collect</h2>
            <p className="mt-2">
              We collect information you provide directly, such as your name, email, and travel search preferences.
              We also collect booking and payment information necessary to complete transactions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white">2. How we use your information</h2>
            <p className="mt-2">
              We use your information to provide travel comparison services, process bookings, communicate with you,
              and improve our platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white">3. Data security</h2>
            <p className="mt-2">
              We use industry-standard security measures including encrypted sessions and masked payment details.
              Sensitive data is never stored in plain text.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white">4. Third-party services</h2>
            <p className="mt-2">
              We may share necessary booking details with travel platforms and payment processors to complete your booking.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white">5. Contact us</h2>
            <p className="mt-2">
              If you have questions about this Privacy Policy, contact us at support@tripzy.app.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
