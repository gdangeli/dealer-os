"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav 
      aria-label="Breadcrumb" 
      className={cn("flex items-center text-sm text-slate-500", className)}
    >
      <Link 
        href="/dashboard" 
        className="flex items-center hover:text-slate-700 transition-colors"
        aria-label="Dashboard"
      >
        <Home className="h-4 w-4" />
      </Link>
      
      {items.map((item, index) => (
        <span key={index} className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-2 text-slate-300" />
          {item.href ? (
            <Link 
              href={item.href}
              className="hover:text-slate-700 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-900 font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
