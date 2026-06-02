import type { Metadata } from "next";
import { Playfair_Display, Source_Serif_4, Inter } from "next/font/google";
import "./globals.css";
import SiteShell from "@/components/layout/SiteShell";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ReporterWidgetWrapper } from "@/components/reporter/ReporterWidgetWrapper";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "600", "700", "900"],
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
  weight: ["300", "400", "600"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
    <html lang="en" className={`${playfair.variable} ${sourceSerif.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-paper text-ink antialiased">
        <AuthProvider>
          <SiteShell>{children}</SiteShell>
          <ReporterWidgetWrapper />
        </AuthProvider>
      </body>
    </html>
  );
}
