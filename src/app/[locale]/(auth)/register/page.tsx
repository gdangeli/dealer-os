"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { Link } from "@/i18n/navigation";
import { Check, Shield, ArrowRight, Sparkles } from "lucide-react";

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
      <div className="min-h-screen hero-gradient flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center glow">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-white" strokeWidth={3} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Fast geschafft!</h2>
            <p className="text-gray-600 mb-8">
              Wir haben Ihnen eine E-Mail geschickt. Klicken Sie auf den Link, um Ihr Konto zu aktivieren.
            </p>
            <Link 
              href="/login"
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl hover:shadow-indigo-500/30 transition-all"
            >
              Zum Login
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-3xl">🚗</span>
            <span className="text-2xl font-bold text-gray-900">Dealer OS</span>
          </Link>
          
          {/* Beta Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 to-indigo-600 text-white rounded-full px-4 py-1.5 mb-4 font-medium text-sm">
            <Sparkles className="w-4 h-4" />
            <span>Gratis Beta</span>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("title")}</h1>
          <p className="text-gray-600">{t("subtitle")}</p>
        </div>

        {/* Register Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 glow">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-4 text-sm text-red-700 bg-red-50 rounded-xl border border-red-100">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="companyName" className="text-gray-700 font-medium">Name Ihrer Garage</Label>
              <Input
                id="companyName"
                placeholder="z.B. Auto Meier GmbH"
                value={formData.companyName}
                onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                required
                className="h-12 rounded-xl border-gray-200 focus:border-sky-500 focus:ring-sky-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contactName" className="text-gray-700 font-medium">Ihr Name</Label>
              <Input
                id="contactName"
                placeholder="Vor- und Nachname"
                value={formData.contactName}
                onChange={(e) => setFormData({...formData, contactName: e.target.value})}
                required
                className="h-12 rounded-xl border-gray-200 focus:border-sky-500 focus:ring-sky-500"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">{t("email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@garage.ch"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  className="h-12 rounded-xl border-gray-200 focus:border-sky-500 focus:ring-sky-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-700 font-medium">Telefon</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="079 123 45 67"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required
                  className="h-12 rounded-xl border-gray-200 focus:border-sky-500 focus:ring-sky-500"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="vehicleCount" className="text-gray-700 font-medium">Fahrzeuge im Bestand (ca.)</Label>
              <Input
                id="vehicleCount"
                placeholder="z.B. 20"
                value={formData.vehicleCount}
                onChange={(e) => setFormData({...formData, vehicleCount: e.target.value})}
                required
                className="h-12 rounded-xl border-gray-200 focus:border-sky-500 focus:ring-sky-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">{t("password")} (min. 8 Zeichen)</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
                minLength={8}
                className="h-12 rounded-xl border-gray-200 focus:border-sky-500 focus:ring-sky-500"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl hover:shadow-indigo-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? tCommon("loading") : t("submit")}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>
          
          <div className="mt-6 text-center text-gray-600">
            {t("hasAccount")}{" "}
            <Link href="/login" className="text-sky-600 hover:text-sky-700 font-semibold">
              {t("login")}
            </Link>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap justify-center items-center gap-4 mt-8 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
              <Check className="w-3 h-3 text-emerald-600" strokeWidth={3} />
            </div>
            <span>Keine Kreditkarte nötig</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
              <Check className="w-3 h-3 text-emerald-600" strokeWidth={3} />
            </div>
            <span>In 2 Min. startklar</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-sky-100 flex items-center justify-center">
              <Shield className="w-3 h-3 text-sky-600" />
            </div>
            <span>Schweizer Hosting</span>
          </div>
        </div>
      </div>
    </div>
  );
}
