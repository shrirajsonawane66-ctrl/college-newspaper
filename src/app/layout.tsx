import type { Metadata } from "next";
import { Playfair_Display, Source_Serif_4, Inter, Archivo_Narrow } from "next/font/google";
import "./globals.css";
import SiteShell from "@/components/layout/SiteShell";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ReporterWidgetWrapper } from "@/components/reporter/ReporterWidgetWrapper";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "600", "700", "800", "900"],
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
  weight: ["300", "400", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const archivo = Archivo_Narrow({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Campus TIMELINE — The Official College Newspaper",
    template: "%s — Campus TIMELINE",
  },
  description: "The official student newspaper of Campus — bringing you campus news, announcements, achievements, and events since 2026.",
  openGraph: {
    title: "Campus TIMELINE — The Official College Newspaper",
    description: "The official student newspaper of Campus — bringing you campus news, announcements, achievements, and events since 2026.",
    type: "website",
    siteName: "Campus TIMELINE",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Campus TIMELINE — The Official College Newspaper",
    description: "The official student newspaper of Campus — bringing you campus news, announcements, achievements, and events since 2026.",
  },
  robots: {
    index: true,
    follow: true,
  },
  keywords: ["college newspaper", "campus news", "student newspaper", "Campus", "student journalism"],
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${sourceSerif.variable} ${inter.variable} ${archivo.variable}`}>
      <body className="min-h-screen bg-paper text-ink antialiased">
        <AuthProvider>
          <SiteShell>{children}</SiteShell>
          <ReporterWidgetWrapper />
        </AuthProvider>
      </body>
    </html>
  );
}
