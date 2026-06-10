import type { Metadata } from "next";
import Script from "next/script";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ParticleBackground from "@/components/ParticleBackground";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.attackfeed.com"),
  title: {
    default: "AttackFeed — Cybersecurity News Aggregator",
    template: "%s | AttackFeed",
  },
  description:
    "Real-time cybersecurity news aggregator by Wagner Cybersecurity LLC. Attack reports, government alerts, vulnerability advisories, privacy news, and fraud warnings — all in one feed.",
  authors: [{ name: "Wagner Cybersecurity LLC", url: "https://wagnercybersecurity.com" }],
  keywords: ["cybersecurity", "security news", "vulnerability alerts", "CISA", "CVE", "threat intelligence"],
  openGraph: {
    title: "AttackFeed — Cybersecurity News Aggregator",
    description: "Real-time cybersecurity news from top security sources, updated hourly.",
    type: "website",
    url: "https://www.attackfeed.com",
  },
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

  return (
    <html lang="en" className="dark">
      {/* background color lives on <html> (globals.css) so the fixed
          negative-z canvas isn't hidden behind an opaque body background */}
      <body className="min-h-screen text-text-primary antialiased">
        <ParticleBackground />
        <Header />
        <main>{children}</main>
        <Footer />
        {gaId && <GoogleAnalytics gaId={gaId} />}
        {adsenseClient && (
          <Script
            id="adsense"
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
