"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Car, MessageCircle, TrendingUp } from "lucide-react";

interface WelcomeStepProps {
  dealerName?: string;
  onNext: () => void;
}

export function WelcomeStep({ dealerName, onNext }: WelcomeStepProps) {
  const [showContent, setShowContent] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Staggered animations
    const t1 = setTimeout(() => setShowContent(true), 200);
    const t2 = setTimeout(() => setShowFeatures(true), 600);
    const t3 = setTimeout(() => setShowButton(true), 1000);
    
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const features = [
    {
      icon: Car,
      title: "Fahrzeuge verwalten",
      description: "Bestand übersichtlich im Griff – mit Bildern, Preisen und Status.",
    },
    {
      icon: MessageCircle,
      title: "Anfragen zentralisieren",
      description: "Alle Kundenanfragen an einem Ort – nie wieder etwas verpassen.",
    },
    {
      icon: TrendingUp,
      title: "Verkäufe steigern",
      description: "Mit Auswertungen und Insights besser verkaufen.",
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className={`
        w-full max-w-lg transition-all duration-700 transform
        ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
      `}>
        <CardHeader className="text-center pb-2">
          {/* Animated emoji */}
          <div className="relative mx-auto mb-4">
            <span className="text-7xl inline-block animate-bounce">🚗</span>
            <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-yellow-500 animate-pulse" />
          </div>
          
          <CardTitle className="text-3xl font-bold">
            {dealerName ? (
              <>Willkommen, {dealerName}!</>
            ) : (
              <>Willkommen bei Dealer OS!</>
            )}
          </CardTitle>
          
          <CardDescription className="text-lg mt-2">
            Schön, dass du dabei bist! 🎉<br />
            In wenigen Minuten ist alles eingerichtet.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Features */}
          <div className={`
            space-y-4 transition-all duration-500 delay-200
            ${showFeatures ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}>
            <h3 className="font-semibold text-slate-700 text-center">
              Das erwartet dich:
            </h3>
            
            <div className="space-y-3">
              {features.map((feature, index) => (
                <div 
                  key={feature.title}
                  className={`
                    flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100
                    transition-all duration-300
                  `}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600 shrink-0">
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">{feature.title}</div>
                    <div className="text-sm text-slate-600">{feature.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className={`
            pt-4 transition-all duration-500
            ${showButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}>
            <Button 
              onClick={onNext} 
              size="lg" 
              className="w-full text-lg h-14 bg-blue-600 hover:bg-blue-700 transition-all hover:scale-[1.02]"
            >
              Los geht&apos;s! 🚀
            </Button>
            
            <p className="text-center text-sm text-slate-500 mt-4">
              ⏱️ Dauert nur ca. 3 Minuten
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
