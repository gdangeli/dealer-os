"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { Link } from "@/i18n/navigation";

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
  const supabase = createClient();
  const t = useTranslations("auth.register");
  const tCommon = useTranslations("common");
  const locale = useLocale();

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
            <CardTitle>Fast geschafft!</CardTitle>
            <CardDescription>
              Wir haben Ihnen eine E-Mail geschickt. Klicken Sie auf den Link, um Ihr Konto zu aktivieren.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/login">
              <Button className="w-full">{t("login")}</Button>
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
            <Badge>Gratis Beta</Badge>
          </div>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="companyName">Name Ihrer Garage</Label>
              <Input
                id="companyName"
                placeholder="z.B. Auto Meier GmbH"
                value={formData.companyName}
                onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactName">Ihr Name</Label>
              <Input
                id="contactName"
                placeholder="Vor- und Nachname"
                value={formData.contactName}
                onChange={(e) => setFormData({...formData, contactName: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@ihre-garage.ch"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon (für Rückfragen)</Label>
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
              <Label htmlFor="vehicleCount">Fahrzeuge im Bestand (ungefähr)</Label>
              <Input
                id="vehicleCount"
                placeholder="z.B. 20"
                value={formData.vehicleCount}
                onChange={(e) => setFormData({...formData, vehicleCount: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("password")} (min. 8 Zeichen)</Label>
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
              {loading ? tCommon("loading") : t("submit")}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-slate-600">
            {t("hasAccount")}{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              {t("login")}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
