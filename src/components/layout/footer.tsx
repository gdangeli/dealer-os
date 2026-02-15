import Link from "next/link";
import { Car } from "lucide-react";

const footerLinks = {
  produkt: [
    { name: "Features", href: "/#features" },
    { name: "Preise", href: "/#pricing" },
    { name: "Roadmap", href: "/#roadmap" },
  ],
  ressourcen: [
    { name: "Blog", href: "/blog" },
    { name: "Hilfe", href: "/help" },
    { name: "Kontakt", href: "/contact" },
  ],
  rechtliches: [
    { name: "Datenschutz", href: "/privacy" },
    { name: "AGB", href: "/terms" },
    { name: "Impressum", href: "/imprint" },
  ],
};

export function Footer() {
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
              Die Software für Schweizer Autohändler, die ihr Geschäft ernst nehmen.
            </p>
          </div>

          {/* Produkt */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Produkt</h3>
            <ul className="space-y-3">
              {footerLinks.produkt.map((link) => (
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

          {/* Ressourcen */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Ressourcen</h3>
            <ul className="space-y-3">
              {footerLinks.ressourcen.map((link) => (
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

          {/* Rechtliches */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Rechtliches</h3>
            <ul className="space-y-3">
              {footerLinks.rechtliches.map((link) => (
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
            © {new Date().getFullYear()} Dealer OS. Alle Rechte vorbehalten.
          </p>
          <p className="text-sm text-slate-500">
            Made with ❤️ in der Schweiz 🇨🇭
          </p>
        </div>
      </div>
    </footer>
  );
}
