"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, localeNames, localeFlags, type Locale } from "@/i18n/config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const handleLocaleChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2 px-3 py-2 h-auto">
          <Globe className="h-4 w-4 text-slate-500" />
          <span className="text-sm">{localeFlags[locale as Locale]} {localeNames[locale as Locale]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-40">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => handleLocaleChange(loc)}
            className={`flex items-center gap-2 cursor-pointer ${
              locale === loc ? "bg-slate-100 font-medium" : ""
            }`}
          >
            <span>{localeFlags[loc]}</span>
            <span>{localeNames[loc]}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
