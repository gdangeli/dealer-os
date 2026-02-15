import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Dealer OS – Autohandel, vereinfacht",
    template: "%s | Dealer OS",
  },
  description: "Die Software für Schweizer Autohändler und Garagisten. Fahrzeugverwaltung, Lead-Management und Kennzahlen in einer Plattform.",
  keywords: [
    "Autohandel Software",
    "Garage Software Schweiz",
    "Fahrzeugverwaltung",
    "Autohändler Software",
    "KMU Autohandel",
    "Dealer Management System",
    "Lead Management Garage",
    "Standzeit Tracking",
  ],
  authors: [{ name: "Dealer OS" }],
  creator: "Dealer OS",
  openGraph: {
    type: "website",
    locale: "de_CH",
    url: "https://dealeros.ch",
    siteName: "Dealer OS",
    title: "Dealer OS – Autohandel, vereinfacht",
    description: "Die Software für Schweizer Autohändler und Garagisten. Fahrzeugverwaltung, Lead-Management und Kennzahlen in einer Plattform.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dealer OS – Autohandel, vereinfacht",
    description: "Die Software für Schweizer Autohändler und Garagisten.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de-CH" className="scroll-smooth">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
