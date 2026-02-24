"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Rocket, Lock } from "lucide-react";

export default function ComingSoonPage() {
  const t = useTranslations("comingSoon");
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    try {
      const response = await fetch(`/api/unlock?key=${encodeURIComponent(password)}`);
      if (response.ok) {
        router.push("/");
        router.refresh();
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Dealer<span className="text-blue-400">OS</span>
          </h1>
          <p className="text-blue-400/80 text-lg">
            Die moderne Plattform für Schweizer Autohändler
          </p>
        </div>

        {/* Coming Soon Badge */}
        <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 rounded-full px-4 py-2 mb-8">
          <Rocket className="w-4 h-4 text-blue-400" />
          <span className="text-blue-300 text-sm font-medium">Coming Soon</span>
        </div>

        {/* Main Message */}
        <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">
          Wir arbeiten an etwas Grossartigem
        </h2>
        <p className="text-slate-400 text-lg mb-12 max-w-lg mx-auto">
          DealerOS wird bald verfügbar sein. Die All-in-One Lösung für 
          Fahrzeugverwaltung, Lead-Management und mehr.
        </p>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {[
            { title: "Fahrzeugverwaltung", desc: "Bestand zentral verwalten" },
            { title: "Lead-Management", desc: "Keine Anfrage verlieren" },
            { title: "Multi-Plattform", desc: "AutoScout24 & mehr" },
          ].map((feature, i) => (
            <div
              key={i}
              className="bg-white/5 border border-white/10 rounded-xl p-4"
            >
              <h3 className="text-white font-medium mb-1">{feature.title}</h3>
              <p className="text-slate-500 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Hidden Unlock Form */}
        <div className="mt-16 pt-8 border-t border-white/10">
          <form onSubmit={handleUnlock} className="max-w-xs mx-auto">
            <div className="flex items-center gap-2 text-slate-500 text-sm mb-3">
              <Lock className="w-3 h-3" />
              <span>Zugang für Berechtigte</span>
            </div>
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="Passwort"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-600"
              />
              <Button 
                type="submit" 
                disabled={loading || !password}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? "..." : "Unlock"}
              </Button>
            </div>
            {error && (
              <p className="text-red-400 text-sm mt-2">
                Falsches Passwort
              </p>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="mt-16 text-slate-600 text-sm">
          © {new Date().getFullYear()} DealerOS. Alle Rechte vorbehalten.
        </div>
      </div>
    </div>
  );
}
