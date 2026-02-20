import { cn } from "@/lib/utils";
import { Button } from "./button";
import Link from "next/link";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}

export function EmptyState({ 
  icon = "📭", 
  title, 
  description, 
  action,
  className 
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-12 px-4 text-center",
      "animate-in fade-in-50 duration-500",
      className
    )}>
      <div className="text-5xl mb-4 animate-bounce-gentle">{icon}</div>
      <h3 className="text-lg font-semibold text-slate-900 mb-1">{title}</h3>
      {description && (
        <p className="text-slate-500 max-w-sm mb-4">{description}</p>
      )}
      {action && (
        action.href ? (
          <Button asChild>
            <Link href={action.href}>{action.label}</Link>
          </Button>
        ) : (
          <Button onClick={action.onClick}>{action.label}</Button>
        )
      )}
    </div>
  );
}
