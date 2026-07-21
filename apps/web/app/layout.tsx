import type { Metadata } from "next";
import { Sora, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";

const headingFont = Sora({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-heading",
});

const bodyFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Tripzy - Find the Cheapest Real Final Cost for Your Trip",
  description:
    "Tripzy compares flights and trains across platforms and shows you the true final price — discounts, cashback, and hidden fees included.",
  keywords: [
    "travel comparison",
    "cheap flights",
    "cheap trains",
    "trip planner",
    "India travel",
    "MakeMyTrip",
    "Goibibo",
    "Ixigo",
    "no hidden fees",
  ],
  openGraph: {
    title: "Tripzy - Find the Cheapest Real Final Cost for Your Trip",
    description:
      "Compare travel options across platforms and book the true final price — no hidden fees.",
    type: "website",
    url: "https://tripzy-10.vercel.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tripzy - Find the Cheapest Real Final Cost for Your Trip",
    description:
      "Compare travel options across platforms and book the true final price — no hidden fees.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${headingFont.variable} ${bodyFont.variable}`}>
        <div className="tripzy-app flex min-h-dvh flex-col">
          <div className="pointer-events-none fixed inset-0 -z-10">
            <div className="orb orb-a" />
            <div className="orb orb-b" />
            <div className="orb orb-c" />
          </div>
          <NavBar />
          <div className="relative z-10 flex-1">{children}</div>
          <Footer />
        </div>
      </body>
    </html>
  );
}
