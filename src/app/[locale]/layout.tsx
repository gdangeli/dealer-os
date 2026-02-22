import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import { locales, type Locale } from "@/i18n/config";
import "../globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const messages = await getMessages();
  const metadata = messages.metadata as {
    title: string;
    description: string;
    titleTemplate: string;
  };

  return {
    title: {
      default: metadata.title,
      template: metadata.titleTemplate.replace("{title}", "%s"),
    },
    description: metadata.description,
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
      locale: locale === "de" ? "de_CH" : locale,
      url: "https://www.dealeros.ch",
      siteName: "Dealer OS",
      title: metadata.title,
      description: metadata.description,
    },
    twitter: {
      card: "summary_large_image",
      title: metadata.title,
      description: metadata.description,
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: `https://www.dealeros.ch/${locale}`,
      languages: {
        de: "https://www.dealeros.ch/de",
        en: "https://www.dealeros.ch/en",
        fr: "https://www.dealeros.ch/fr",
        it: "https://www.dealeros.ch/it",
        sr: "https://www.dealeros.ch/sr",
      },
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  // Validate locale
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Get messages for the locale
  const messages = await getMessages();

  return (
    <html lang={locale} className="scroll-smooth">
      <body className={`${plusJakartaSans.variable} font-sans antialiased`}>
        <NextIntlClientProvider messages={messages}>
          {children}
          <Toaster position="top-right" richColors />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
