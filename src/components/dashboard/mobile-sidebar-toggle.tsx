"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileSidebarToggleProps {
  children: React.ReactNode;
}

export function MobileSidebarToggle({ children }: MobileSidebarToggleProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    const handleRouteChange = () => setIsOpen(false);
    window.addEventListener("popstate", handleRouteChange);
    return () => window.removeEventListener("popstate", handleRouteChange);
  }, []);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Mobile toggle button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Menu schliessen" : "Menu öffnen"}
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar wrapper */}
      <div
        className={`
          fixed left-0 top-0 w-64 h-screen bg-white border-r border-slate-200 
          flex flex-col z-40 transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {children}
      </div>
    </>
  );
}
