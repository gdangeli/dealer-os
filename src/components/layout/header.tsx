"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Menu, X, Car, Globe } from "lucide-react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { locales, localeNames, localeFlags, type Locale } from "@/i18n/config";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const t = useTranslations("header");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const navigation = [
    { name: t("features"), href: "/#features" },
    { name: t("pricing"), href: "/#pricing" },
    { name: t("blog"), href: "/blog" },
  ];

  const handleLocaleChange = (newLocale: Locale) => {
    router.replace(pathname, { locale: newLocale });
    setLangMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900">
              <Car className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">Dealer OS</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop CTA + Language Switcher */}
          <div className="hidden md:flex md:items-center md:gap-3">
            {/* Language Switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
              >
                <Globe className="h-4 w-4" />
                <span>{localeFlags[locale as Locale]}</span>
              </button>
              
              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                  {locales.map((loc) => (
                    <button
                      key={loc}
                      onClick={() => handleLocaleChange(loc)}
                      className={`w-full flex items-center gap-2 px-4 py-2 text-sm text-left hover:bg-slate-50 transition-colors ${
                        locale === loc ? "bg-slate-50 font-medium" : ""
                      }`}
                    >
                      <span>{localeFlags[loc]}</span>
                      <span>{localeNames[loc]}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button variant="ghost" asChild>
              <Link href="/login">{t("login")}</Link>
            </Button>
            <Button asChild>
              <Link href="/register">{t("register")}</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">{t("openMenu")}</span>
            {mobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 py-4">
            <div className="flex flex-col space-y-3">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-base font-medium text-slate-600 hover:text-slate-900 px-2 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Mobile Language Switcher */}
              <div className="px-2 py-2">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">
                  Language
                </p>
                <div className="flex flex-wrap gap-2">
                  {locales.map((loc) => (
                    <button
                      key={loc}
                      onClick={() => {
                        handleLocaleChange(loc);
                        setMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
                        locale === loc
                          ? "bg-sky-100 text-sky-700"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      <span>{localeFlags[loc]}</span>
                      <span>{localeNames[loc]}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col gap-2 pt-4 border-t border-slate-200">
                <Button variant="outline" asChild className="w-full">
                  <Link href="/login">{t("login")}</Link>
                </Button>
                <Button asChild className="w-full">
                  <Link href="/register">{t("register")}</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
