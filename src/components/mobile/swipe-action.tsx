"use client";

import { useState, useRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SwipeAction {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  className?: string;
}

interface SwipeActionRowProps {
  children: ReactNode;
  actions?: SwipeAction[];
  threshold?: number;
  className?: string;
}

export function SwipeActionRow({
  children,
  actions = [],
  threshold = 80,
  className,
}: SwipeActionRowProps) {
  const [translateX, setTranslateX] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);
  const isDragging = useRef(false);

  const actionsWidth = actions.length * 80;

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    isDragging.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    
    currentX.current = e.touches[0].clientX;
    const diff = startX.current - currentX.current;
    
    // Only allow swiping left (positive diff)
    if (diff > 0) {
      // Limit the swipe distance
      const newTranslate = Math.min(diff, actionsWidth);
      setTranslateX(newTranslate);
    } else if (isOpen) {
      // Allow swiping back to close
      const newTranslate = Math.max(actionsWidth + diff, 0);
      setTranslateX(newTranslate);
    }
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
    
    if (translateX > threshold) {
      // Open actions
      setTranslateX(actionsWidth);
      setIsOpen(true);
    } else {
      // Close actions
      setTranslateX(0);
      setIsOpen(false);
    }
  };

  const handleClose = () => {
    setTranslateX(0);
    setIsOpen(false);
  };

  if (actions.length === 0) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={cn("relative overflow-hidden lg:overflow-visible", className)}>
      {/* Content */}
      <div
        className="relative bg-white transition-transform duration-200 ease-out"
        style={{ transform: `translateX(-${translateX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>

      {/* Actions */}
      <div 
        className="absolute top-0 right-0 h-full flex items-stretch lg:hidden"
        style={{ width: actionsWidth }}
      >
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => {
              action.onClick();
              handleClose();
            }}
            className={cn(
              "flex flex-col items-center justify-center w-20 text-white text-xs font-medium",
              action.className || "bg-red-500"
            )}
          >
            {action.icon}
            <span className="mt-1">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Backdrop to close when tapping outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-10 lg:hidden"
          onClick={handleClose}
        />
      )}
    </div>
  );
}
