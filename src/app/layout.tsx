import type { Metadata } from "next";
import { Playfair_Display, EB_Garamond } from "next/font/google";
import "./globals.css";
import SiteShell from "@/components/layout/SiteShell";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "WCCBM TIMELINE — The Official College Newspaper",
  description: "The official student newspaper of WCCBM — bringing you campus news, announcements, achievements, and events since 1965.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${ebGaramond.variable}`}>
      <body className="min-h-screen bg-paper font-body text-ink antialiased">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
