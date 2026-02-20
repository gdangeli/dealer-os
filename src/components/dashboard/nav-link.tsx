"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useCallback, useState } from "react";

interface NavLinkProps {
  href: string;
  icon: string;
  children: React.ReactNode;
  exact?: boolean;
}

export function NavLink({ href, icon, children, exact = false }: NavLinkProps) {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);
  
  // Remove locale prefix for comparison
  const normalizedPath = pathname.replace(/^\/(de|en|fr|it|sr)/, '');
  const normalizedHref = href.replace(/^\/(de|en|fr|it|sr)/, '');
  
  const isActive = exact 
    ? normalizedPath === normalizedHref
    : normalizedPath.startsWith(normalizedHref) && normalizedHref !== '/dashboard' 
      ? true 
      : normalizedPath === normalizedHref;

  // Prefetch on hover for faster navigation
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  return (
    <Link 
      href={href}
      prefetch={isHovered}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
        "hover:bg-slate-100 hover:translate-x-0.5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        "active:scale-[0.98]",
        isActive 
          ? "bg-primary/10 text-primary font-medium border-l-2 border-primary -ml-[2px] pl-[14px]" 
          : "text-slate-700"
      )}
      aria-current={isActive ? "page" : undefined}
    >
      <span className={cn(
        "transition-transform duration-200",
        isActive && "scale-110"
      )}>{icon}</span>
      <span>{children}</span>
    </Link>
  );
}
