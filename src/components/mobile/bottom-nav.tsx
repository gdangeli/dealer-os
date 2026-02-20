"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Car, Users, FileText, Settings } from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: Home, label: "Übersicht", exact: true },
  { href: "/dashboard/vehicles", icon: Car, label: "Bestand" },
  { href: "/dashboard/leads", icon: Users, label: "Anfragen" },
  { href: "/dashboard/quotes", icon: FileText, label: "Offerten" },
  { href: "/dashboard/settings", icon: Settings, label: "Mehr" },
];

export function BottomNav() {
  const pathname = usePathname();

  // Remove locale prefix for comparison
  const normalizedPath = pathname.replace(/^\/(de|en|fr|it|sr)/, '');

  const isActive = (href: string, exact?: boolean) => {
    const normalizedHref = href.replace(/^\/(de|en|fr|it|sr)/, '');
    if (exact) {
      return normalizedPath === normalizedHref;
    }
    return normalizedPath.startsWith(normalizedHref) && normalizedHref !== '/dashboard';
  };

  return (
    <nav 
      className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 safe-area-pb"
      aria-label="Mobile Navigation"
    >
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full",
                "transition-colors duration-200",
                "active:bg-slate-100",
                active ? "text-primary" : "text-slate-500"
              )}
              aria-current={active ? "page" : undefined}
            >
              <item.icon 
                className={cn(
                  "w-5 h-5 mb-1",
                  active && "scale-110 transition-transform"
                )} 
              />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
