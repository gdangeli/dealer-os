"use client";

import { useTranslations } from "next-intl";
import { Car } from "lucide-react";
import { Link } from "@/i18n/navigation";

export function Footer() {
  const t = useTranslations("footer");
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: t("features"), href: "/#features" },
      { name: t("pricing"), href: "/#pricing" },
      { name: t("roadmap"), href: "/#roadmap" },
    ],
    resources: [
      { name: t("blog"), href: "/blog" },
      { name: t("help"), href: "/hilfe" },
      { name: t("contact"), href: "/kontakt" },
    ],
    legal: [
      { name: t("privacy"), href: "/datenschutz" },
      { name: t("terms"), href: "/agb" },
      { name: t("imprint"), href: "/impressum" },
    ],
  };

  return (
    <footer className="bg-slate-50 border-t border-slate-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900">
                <Car className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">Dealer OS</span>
            </Link>
            <p className="mt-4 text-sm text-slate-600 leading-relaxed">
              {t("tagline")}
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4">
              {t("product")}
            </h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4">
              {t("resources")}
            </h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4">
              {t("legal")}
            </h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            {t("copyright", { year: currentYear })}
          </p>
          <p className="text-sm text-slate-500">{t("madeIn")}</p>
        </div>
      </div>
    </footer>
  );
}
