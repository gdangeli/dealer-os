"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Loader2, PartyPopper, MessageCircle, Headphones, ArrowRight } from "lucide-react";

interface CompleteStepProps {
  companyName: string;
  hasVehicle: boolean;
  hasLocation: boolean;
  onComplete: () => Promise<void>;
  saving: boolean;
}

// Simple confetti particle component
function ConfettiParticle({ delay, left }: { delay: number; left: number }) {
  const colors = ['bg-red-500', 'bg-blue-500', 'bg-yellow-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const size = Math.random() * 8 + 6;
  const duration = Math.random() * 2 + 2;

  return (
    <div
      className={`absolute ${color} rounded-full opacity-80`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        left: `${left}%`,
        top: '-10px',
        animation: `confetti-fall ${duration}s ease-out ${delay}s forwards`,
      }}
    />
  );
}

export function CompleteStep({ companyName, hasVehicle, hasLocation, onComplete, saving }: CompleteStepProps) {
  const router = useRouter();
  const locale = useLocale();
  const [showContent, setShowContent] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; delay: number; left: number }>>([]);

  useEffect(() => {
    // Create confetti particles
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      delay: Math.random() * 0.5,
      left: Math.random() * 100,
    }));
    setParticles(newParticles);

    // Staggered animations
    const t1 = setTimeout(() => setShowContent(true), 300);
    const t2 = setTimeout(() => setShowChecklist(true), 800);
    const t3 = setTimeout(() => setShowButtons(true), 1200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const handleGoToDashboard = async () => {
    await onComplete();
    router.push(`/${locale}/dashboard`);
  };

  const checklistItems = [
    { label: 'Firmenprofil eingerichtet', done: true },
    { label: 'Standort hinzugefügt', done: hasLocation },
    { label: 'Erstes Fahrzeug erfasst', done: hasVehicle },
    { label: 'Benachrichtigungen konfiguriert', done: true },
    { label: 'Tour abgeschlossen', done: true },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Confetti Animation */}
      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
      
      {particles.map((particle) => (
        <ConfettiParticle key={particle.id} delay={particle.delay} left={particle.left} />
      ))}

      <Card className={`
        w-full max-w-lg relative z-10 transition-all duration-700 transform
        ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
      `}>
        <CardHeader className="text-center">
          {/* Animated celebration icon */}
          <div className="relative mx-auto mb-4">
            <div className="text-7xl animate-bounce">🎉</div>
            <PartyPopper className="absolute -top-2 -right-4 w-8 h-8 text-purple-500 animate-pulse" />
            <PartyPopper className="absolute -top-2 -left-4 w-8 h-8 text-yellow-500 animate-pulse" style={{ animationDelay: '0.3s' }} />
          </div>
          
          <CardTitle className="text-3xl font-bold text-green-600">
            Super gemacht! 🚀
          </CardTitle>
          
          <CardDescription className="text-lg mt-2">
            {companyName} ist jetzt startklar für Dealer OS.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Checklist */}
          <div className={`
            transition-all duration-500
            ${showChecklist ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}>
            <h3 className="font-semibold text-slate-700 mb-3">Was du eingerichtet hast:</h3>
            <div className="space-y-2">
              {checklistItems.map((item, index) => (
                <div 
                  key={item.label}
                  className={`
                    flex items-center gap-3 p-3 rounded-lg transition-all duration-300
                    ${item.done ? 'bg-green-50 border border-green-200' : 'bg-slate-50 border border-slate-200'}
                  `}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className={`
                    w-6 h-6 rounded-full flex items-center justify-center shrink-0
                    ${item.done ? 'bg-green-500 text-white' : 'bg-slate-300 text-slate-500'}
                  `}>
                    {item.done ? <Check className="w-4 h-4" /> : <span className="text-xs">–</span>}
                  </div>
                  <span className={item.done ? 'text-green-800' : 'text-slate-500'}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Help Box */}
          <div className={`
            p-4 bg-blue-50 rounded-lg border border-blue-200 transition-all duration-500
            ${showButtons ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}>
            <div className="flex items-start gap-3">
              <Headphones className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Hilfe jederzeit verfügbar</p>
                <p className="text-sm text-blue-700 mt-1">
                  Fragen? Unser Support-Team ist für dich da – per WhatsApp oder E-Mail.
                </p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className={`
            space-y-3 pt-4 transition-all duration-500
            ${showButtons ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}>
            <Button 
              onClick={handleGoToDashboard}
              size="lg" 
              className="w-full h-14 text-lg bg-green-600 hover:bg-green-700 transition-all hover:scale-[1.02]"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Wird geladen...
                </>
              ) : (
                <>
                  Ab ins Dashboard!
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
            
            <a
              href="https://wa.me/41791234567?text=Hallo!%20Ich%20habe%20gerade%20DealerOS%20eingerichtet%20und%20habe%20eine%20Frage."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full h-12 rounded-lg border-2 border-green-300 text-green-700 hover:bg-green-50 transition-colors font-medium"
            >
              <MessageCircle className="w-5 h-5" />
              WhatsApp Support
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
