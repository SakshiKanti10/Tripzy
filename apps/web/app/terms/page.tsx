import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - Tripzy",
  description: "Tripzy terms of service.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="panel p-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Terms of Service</h1>
        <p className="mt-4 text-sm text-slate-400">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-slate-300">
          <section>
            <h2 className="text-lg font-bold text-white">1. Acceptance of terms</h2>
            <p className="mt-2">
              By accessing or using Tripzy, you agree to be bound by these Terms of Service. If you do not agree,
              please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white">2. Use of service</h2>
            <p className="mt-2">
              Tripzy provides travel price comparison and booking facilitation. We do not operate flights or trains ourselves.
              Bookings are subject to the terms of the respective travel platforms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white">3. Accounts</h2>
            <p className="mt-2">
              You are responsible for maintaining the confidentiality of your account credentials and for all activities
              that occur under your account.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white">4. Limitation of liability</h2>
            <p className="mt-2">
              Tripzy is not liable for disputes, cancellations, or issues arising from third-party travel providers.
              Prices shown are for comparison purposes and may change before final booking.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white">5. Changes to terms</h2>
            <p className="mt-2">
              We may update these terms from time to time. Continued use of the service constitutes acceptance of the updated terms.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
