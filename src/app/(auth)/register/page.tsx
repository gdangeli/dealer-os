"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    vehicleCount: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          company_name: formData.companyName,
          contact_name: formData.contactName,
        }
      }
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // 2. Create dealer profile
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('dealers')
        .insert({
          user_id: authData.user.id,
          company_name: formData.companyName,
          contact_name: formData.contactName,
          email: formData.email,
          phone: formData.phone,
          vehicle_count_estimate: parseInt(formData.vehicleCount) || null,
          status: 'pending'
        });

      if (profileError) {
        console.error('Profile error:', profileError);
        // Don't block - user is created, profile can be fixed later
      }
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="text-4xl mb-4">✅</div>
            <CardTitle>Registrierung erfolgreich!</CardTitle>
            <CardDescription>
              Bitte bestätigen Sie Ihre E-Mail-Adresse. Wir haben Ihnen einen Link geschickt.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/login">
              <Button className="w-full">Zum Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="flex items-center justify-center gap-2 mb-4">
            <span className="text-2xl">🚗</span>
            <span className="text-xl font-bold">Dealer OS</span>
          </Link>
          <div className="flex justify-center mb-2">
            <Badge>Beta-Programm</Badge>
          </div>
          <CardTitle>Beta-Zugang beantragen</CardTitle>
          <CardDescription>
            Kostenlos während der Beta-Phase. Begrenzte Plätze.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="companyName">Firmenname / Garage</Label>
              <Input
                id="companyName"
                placeholder="Garage Müller AG"
                value={formData.companyName}
                onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactName">Ansprechperson</Label>
              <Input
                id="contactName"
                placeholder="Hans Müller"
                value={formData.contactName}
                onChange={(e) => setFormData({...formData, contactName: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="hans@garage-mueller.ch"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="079 123 45 67"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicleCount">Wie viele Fahrzeuge haben Sie ca. im Bestand?</Label>
              <Input
                id="vehicleCount"
                placeholder="z.B. 25"
                value={formData.vehicleCount}
                onChange={(e) => setFormData({...formData, vehicleCount: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Passwort wählen</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
                minLength={8}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Wird registriert..." : "Beta-Zugang beantragen"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-slate-600">
            Bereits registriert?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              Anmelden
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
