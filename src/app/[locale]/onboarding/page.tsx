"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { Dealer } from "@/types/database";

type Step = 'welcome' | 'company' | 'vehicle' | 'complete';

interface CompanyData {
  company_name: string;
  contact_name: string;
  phone: string;
  street: string;
  zip: string;
  city: string;
}

interface VehicleData {
  make: string;
  model: string;
  first_registration: string;
  mileage: string;
  asking_price: string;
  fuel_type: string;
  transmission: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const locale = useLocale();
  const supabase = createClient();
  
  const [currentStep, setCurrentStep] = useState<Step>('welcome');
  const [dealer, setDealer] = useState<Dealer | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [companyData, setCompanyData] = useState<CompanyData>({
    company_name: '',
    contact_name: '',
    phone: '',
    street: '',
    zip: '',
    city: '',
  });

  const [vehicleData, setVehicleData] = useState<VehicleData>({
    make: '',
    model: '',
    first_registration: '',
    mileage: '',
    asking_price: '',
    fuel_type: 'petrol',
    transmission: 'manual',
  });

  useEffect(() => {
    async function loadDealer() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push(`/${locale}/login`);
        return;
      }

      const { data: dealerData } = await supabase
        .from('dealers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!dealerData) {
        router.push(`/${locale}/login`);
        return;
      }

      if (dealerData.onboarding_completed) {
        router.push(`/${locale}/dashboard`);
        return;
      }

      setDealer(dealerData);
      setCompanyData({
        company_name: dealerData.company_name || '',
        contact_name: dealerData.contact_name || '',
        phone: dealerData.phone || '',
        street: dealerData.street || '',
        zip: dealerData.zip || '',
        city: dealerData.city || '',
      });
      setLoading(false);
    }

    loadDealer();
  }, [supabase, router, locale]);

  const steps: Step[] = ['welcome', 'company', 'vehicle', 'complete'];
  const currentStepIndex = steps.indexOf(currentStep);
  const totalSteps = 3;

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex]);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex]);
    }
  };

  const saveCompanyData = async () => {
    if (!dealer) return;
    setSaving(true);
    setError(null);

    const { error: updateError } = await supabase
      .from('dealers')
      .update({
        company_name: companyData.company_name,
        contact_name: companyData.contact_name,
        phone: companyData.phone,
        street: companyData.street,
        zip: companyData.zip,
        city: companyData.city,
      })
      .eq('id', dealer.id);

    if (updateError) {
      setError('Speichern fehlgeschlagen. Bitte versuchen Sie es erneut.');
      setSaving(false);
      return;
    }

    setSaving(false);
    handleNext();
  };

  const saveVehicle = async () => {
    if (!dealer) return;
    setSaving(true);
    setError(null);

    const { error: insertError } = await supabase
      .from('vehicles')
      .insert({
        dealer_id: dealer.id,
        make: vehicleData.make,
        model: vehicleData.model,
        first_registration: vehicleData.first_registration || null,
        mileage: parseInt(vehicleData.mileage) || 0,
        asking_price: parseInt(vehicleData.asking_price) || 0,
        fuel_type: vehicleData.fuel_type,
        transmission: vehicleData.transmission,
        status: 'in_stock',
      });

    if (insertError) {
      setError('Fahrzeug konnte nicht gespeichert werden.');
      setSaving(false);
      return;
    }

    setSaving(false);
    handleNext();
  };

  const completeOnboarding = async () => {
    if (!dealer) return;
    setSaving(true);

    await supabase
      .from('dealers')
      .update({ onboarding_completed: true })
      .eq('id', dealer.id);

    router.push(`/${locale}/dashboard`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-lg">Laden...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {currentStep !== 'welcome' && currentStep !== 'complete' && (
          <div className="mb-6">
            <div className="flex justify-between text-sm text-slate-400 mb-2">
              <span>Schritt {currentStepIndex} von {totalSteps - 1}</span>
              <span>{Math.round((currentStepIndex / (totalSteps - 1)) * 100)}%</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${(currentStepIndex / (totalSteps - 1)) * 100}%` }}
              />
            </div>
          </div>
        )}

        {currentStep === 'welcome' && (
          <Card>
            <CardHeader className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <CardTitle className="text-2xl">Willkommen bei Dealer OS!</CardTitle>
              <CardDescription className="text-base">
                Schön, dass Sie dabei sind. In wenigen Schritten richten wir Ihr Konto ein.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">Was Sie erwartet:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>✅ Firmendaten vervollständigen</li>
                  <li>✅ Erstes Fahrzeug erfassen (optional)</li>
                  <li>✅ Fertig – ab ins Dashboard!</li>
                </ul>
              </div>
              <Button onClick={handleNext} className="w-full" size="lg">
                Los geht&apos;s! →
              </Button>
            </CardContent>
          </Card>
        )}

        {currentStep === 'company' && (
          <Card>
            <CardHeader>
              <CardTitle>Ihre Firmendaten</CardTitle>
              <CardDescription>
                Vervollständigen Sie Ihre Angaben für einen professionellen Auftritt.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="company_name">Firmenname *</Label>
                  <Input
                    id="company_name"
                    value={companyData.company_name}
                    onChange={(e) => setCompanyData({...companyData, company_name: e.target.value})}
                    placeholder="Auto Meier GmbH"
                    required
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="contact_name">Ansprechperson *</Label>
                  <Input
                    id="contact_name"
                    value={companyData.contact_name}
                    onChange={(e) => setCompanyData({...companyData, contact_name: e.target.value})}
                    placeholder="Hans Meier"
                    required
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    value={companyData.phone}
                    onChange={(e) => setCompanyData({...companyData, phone: e.target.value})}
                    placeholder="044 123 45 67"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="street">Strasse</Label>
                  <Input
                    id="street"
                    value={companyData.street}
                    onChange={(e) => setCompanyData({...companyData, street: e.target.value})}
                    placeholder="Hauptstrasse 10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip">PLZ</Label>
                  <Input
                    id="zip"
                    value={companyData.zip}
                    onChange={(e) => setCompanyData({...companyData, zip: e.target.value})}
                    placeholder="8000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Ort</Label>
                  <Input
                    id="city"
                    value={companyData.city}
                    onChange={(e) => setCompanyData({...companyData, city: e.target.value})}
                    placeholder="Zürich"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={handleBack} className="flex-1">← Zurück</Button>
                <Button 
                  onClick={saveCompanyData} 
                  className="flex-1"
                  disabled={saving || !companyData.company_name || !companyData.contact_name}
                >
                  {saving ? 'Speichern...' : 'Weiter →'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 'vehicle' && (
          <Card>
            <CardHeader>
              <CardTitle>Erstes Fahrzeug erfassen</CardTitle>
              <CardDescription>
                Optional: Erfassen Sie jetzt Ihr erstes Fahrzeug oder überspringen Sie diesen Schritt.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="make">Marke *</Label>
                  <Input
                    id="make"
                    value={vehicleData.make}
                    onChange={(e) => setVehicleData({...vehicleData, make: e.target.value})}
                    placeholder="VW, BMW, Audi..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Modell *</Label>
                  <Input
                    id="model"
                    value={vehicleData.model}
                    onChange={(e) => setVehicleData({...vehicleData, model: e.target.value})}
                    placeholder="Golf, 3er, A4..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="first_registration">Erstzulassung</Label>
                  <Input
                    id="first_registration"
                    type="date"
                    value={vehicleData.first_registration}
                    onChange={(e) => setVehicleData({...vehicleData, first_registration: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mileage">Kilometerstand</Label>
                  <Input
                    id="mileage"
                    type="number"
                    value={vehicleData.mileage}
                    onChange={(e) => setVehicleData({...vehicleData, mileage: e.target.value})}
                    placeholder="85000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fuel_type">Antrieb</Label>
                  <Select
                    value={vehicleData.fuel_type}
                    onValueChange={(value) => setVehicleData({...vehicleData, fuel_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="petrol">Benzin</SelectItem>
                      <SelectItem value="diesel">Diesel</SelectItem>
                      <SelectItem value="electric">Elektro</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transmission">Getriebe</Label>
                  <Select
                    value={vehicleData.transmission}
                    onValueChange={(value) => setVehicleData({...vehicleData, transmission: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Schaltgetriebe</SelectItem>
                      <SelectItem value="automatic">Automat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="asking_price">Verkaufspreis (CHF) *</Label>
                  <Input
                    id="asking_price"
                    type="number"
                    value={vehicleData.asking_price}
                    onChange={(e) => setVehicleData({...vehicleData, asking_price: e.target.value})}
                    placeholder="22900"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={handleBack} className="flex-1">← Zurück</Button>
                <Button variant="ghost" onClick={handleNext} className="flex-1">Überspringen</Button>
                <Button 
                  onClick={saveVehicle} 
                  className="flex-1"
                  disabled={saving || !vehicleData.make || !vehicleData.model}
                >
                  {saving ? 'Speichern...' : 'Speichern →'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 'complete' && (
          <Card>
            <CardHeader className="text-center">
              <div className="text-6xl mb-4">🚀</div>
              <CardTitle className="text-2xl">Alles bereit!</CardTitle>
              <CardDescription className="text-base">
                Ihr Dealer OS Konto ist eingerichtet. Sie können jetzt loslegen!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-900 mb-2">Nächste Schritte:</h3>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>📦 Fahrzeuge im Bestand erfassen</li>
                  <li>📢 Inserate auf AutoScout24 schalten</li>
                  <li>📊 Anfragen & Verkäufe tracken</li>
                </ul>
              </div>
              <Button onClick={completeOnboarding} className="w-full" size="lg" disabled={saving}>
                {saving ? 'Wird geladen...' : 'Zum Dashboard →'}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
