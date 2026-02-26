"use client";

import { useTranslations } from "next-intl";
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
    <footer className="bg-slate-900 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">D</span>
              </div>
              <span className="text-xl font-bold text-white">DealerOS</span>
            </Link>
            <p className="text-slate-400 text-sm">
              {t("tagline")}
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-white font-semibold mb-4">
              {t("product")}
            </h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-semibold mb-4">
              {t("resources")}
            </h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4">
              {t("legal")}
            </h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-400 text-sm">
            © {currentYear} DealerOS. Made with ❤️ in Switzerland.
          </p>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400">🇨🇭</span>
            <span className="text-slate-400">Schweizer Hosting & Support</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
