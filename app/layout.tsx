import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ParticleBackground from "@/components/ParticleBackground";

export const metadata: Metadata = {
  title: {
    default: "AttackFeed — Cybersecurity News Aggregator",
    template: "%s | AttackFeed",
  },
  description:
    "Real-time cybersecurity news aggregator. Attack reports, government alerts, vulnerability advisories, privacy news, and fraud warnings — all in one feed.",
  keywords: ["cybersecurity", "security news", "vulnerability alerts", "CISA", "CVE", "threat intelligence"],
  openGraph: {
    title: "AttackFeed — Cybersecurity News Aggregator",
    description: "Real-time cybersecurity news from top security sources, updated hourly.",
    type: "website",
    url: "https://www.attackfeed.com",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-bg-primary text-text-primary antialiased">
        <ParticleBackground />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
