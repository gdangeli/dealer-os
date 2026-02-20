"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface ResponsiveListItemProps {
  href?: string;
  onClick?: () => void;
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  leftContent?: ReactNode;
  rightContent?: ReactNode;
  meta?: string;
  className?: string;
}

export function ResponsiveListItem({
  href,
  onClick,
  title,
  subtitle,
  badge,
  leftContent,
  rightContent,
  meta,
  className,
}: ResponsiveListItemProps) {
  const content = (
    <>
      {leftContent && (
        <div className="shrink-0 mr-3">
          {leftContent}
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-900 truncate">{title}</span>
          {badge}
        </div>
        {subtitle && (
          <p className="text-sm text-slate-500 truncate mt-0.5">{subtitle}</p>
        )}
        {meta && (
          <p className="text-xs text-slate-400 mt-1">{meta}</p>
        )}
      </div>

      {rightContent && (
        <div className="shrink-0 ml-3 text-right">
          {rightContent}
        </div>
      )}

      {(href || onClick) && (
        <ChevronRight className="w-5 h-5 text-slate-300 ml-2 shrink-0" />
      )}
    </>
  );

  const baseClasses = cn(
    "flex items-center p-4 bg-white",
    "transition-colors duration-150",
    (href || onClick) && "active:bg-slate-50 cursor-pointer",
    className
  );

  if (href) {
    return (
      <Link href={href} className={baseClasses}>
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button onClick={onClick} className={cn(baseClasses, "w-full text-left")}>
        {content}
      </button>
    );
  }

  return <div className={baseClasses}>{content}</div>;
}

interface ResponsiveListProps {
  children: ReactNode;
  className?: string;
  divided?: boolean;
}

export function ResponsiveList({
  children,
  className,
  divided = true,
}: ResponsiveListProps) {
  return (
    <div 
      className={cn(
        "bg-white rounded-lg border border-slate-200 overflow-hidden",
        "lg:rounded-lg",
        divided && "[&>*:not(:last-child)]:border-b [&>*:not(:last-child)]:border-slate-100",
        className
      )}
    >
      {children}
    </div>
  );
}

// Empty state for lists
interface EmptyListProps {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyList({ icon = "📭", title, description, action }: EmptyListProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 max-w-sm mb-4">{description}</p>
      )}
      {action}
    </div>
  );
}
