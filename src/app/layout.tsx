import type { Metadata } from "next";
import { Playfair_Display, EB_Garamond, Open_Sans } from "next/font/google";
import "./globals.css";
import SiteShell from "@/components/layout/SiteShell";
import { AuthProvider } from "@/components/auth/AuthProvider";

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

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-clock",
  display: "swap",
});

export const metadata: Metadata = {
  title: "WCCBM TIMELINE — The Official College Newspaper",
  description: "The official student newspaper of WCCBM — bringing you campus news, announcements, achievements, and events since 2026.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${ebGaramond.variable} ${openSans.variable}`}>
      <body className="min-h-screen bg-paper font-body text-ink antialiased">
        <AuthProvider>
          <SiteShell>{children}</SiteShell>
        </AuthProvider>
      </body>
    </html>
  );
}
