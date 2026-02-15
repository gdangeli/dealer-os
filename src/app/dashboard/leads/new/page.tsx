"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LeadSource, leadSourceLabels } from "@/types/leads";

interface Vehicle {
  id: string;
  make: string;
  model: string;
  first_registration: string | null;
  asking_price: number | null;
}

export default function NewLeadPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [source, setSource] = useState<LeadSource>("walkin");
  const [vehicleId, setVehicleId] = useState<string>("");
  const [message, setMessage] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchVehicles();
  }, []);

  async function fetchVehicles() {
    const { data, error } = await supabase
      .from("vehicles")
      .select("id, make, model, first_registration, asking_price")
      .order("make", { ascending: true });

    if (error) {
      console.error("Error fetching vehicles:", error);
    } else {
      setVehicles(data || []);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!firstName || !lastName) {
      alert("Bitte Vor- und Nachname eingeben");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("leads")
      .insert({
        first_name: firstName,
        last_name: lastName,
        email: email || null,
        phone: phone || null,
        source,
        vehicle_id: vehicleId || null,
        message: message || null,
        notes: notes || null,
        status: "new",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating lead:", error);
      alert("Fehler beim Erstellen der Anfrage");
      setLoading(false);
    } else {
      router.push(`/dashboard/leads/${data.id}`);
    }
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat("de-CH", {
      style: "currency",
      currency: "CHF",
      minimumFractionDigits: 0,
    }).format(price);
  }

  return (
    <div>
      <div className="mb-8">
        <Link href="/dashboard/leads" className="text-slate-500 hover:text-slate-700">
          ← Zurück zur Übersicht
        </Link>
        <h1 className="text-3xl font-bold mt-2">Neue Anfrage erfassen</h1>
        <p className="text-slate-600">Walk-in oder Telefonanfrage manuell erfassen</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="col-span-2 space-y-6">
            {/* Kontaktdaten */}
            <Card>
              <CardHeader>
                <CardTitle>Kontaktdaten</CardTitle>
                <CardDescription>Informationen zum Interessenten</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Vorname *</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nachname *</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">E-Mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="optional"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefon</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="optional"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Nachricht */}
            <Card>
              <CardHeader>
                <CardTitle>Anfrage-Details</CardTitle>
                <CardDescription>Was hat der Kunde gesagt oder gefragt?</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="z.B. 'Kunde interessiert sich für den BMW, möchte Probefahrt machen'"
                  rows={4}
                />
              </CardContent>
            </Card>

            {/* Interne Notizen */}
            <Card>
              <CardHeader>
                <CardTitle>Interne Notizen</CardTitle>
                <CardDescription>Nur für interne Verwendung</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="z.B. 'Wirkt sehr kaufbereit, Budget ca. 25k'"
                  rows={3}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quelle */}
            <Card>
              <CardHeader>
                <CardTitle>Quelle</CardTitle>
                <CardDescription>Woher kam die Anfrage?</CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={source} onValueChange={(value) => setSource(value as LeadSource)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="walkin">🚶 Walk-in</SelectItem>
                    <SelectItem value="phone">📞 Telefon</SelectItem>
                    <SelectItem value="website">🌐 Website</SelectItem>
                    <SelectItem value="autoscout24">🚗 AutoScout24</SelectItem>
                    <SelectItem value="mobile.de">📱 mobile.de</SelectItem>
                    <SelectItem value="other">📋 Sonstige</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Fahrzeug */}
            <Card>
              <CardHeader>
                <CardTitle>Fahrzeug</CardTitle>
                <CardDescription>Für welches Fahrzeug interessiert sich der Kunde?</CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={vehicleId} onValueChange={setVehicleId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Fahrzeug auswählen (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Kein spezifisches Fahrzeug</SelectItem>
                    {vehicles.map((vehicle) => {
                      const year = vehicle.first_registration 
                        ? new Date(vehicle.first_registration).getFullYear() 
                        : "";
                      const price = vehicle.asking_price 
                        ? ` - ${formatPrice(vehicle.asking_price)}` 
                        : "";
                      return (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.make} {vehicle.model}{year ? ` (${year})` : ""}{price}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {vehicles.length === 0 && (
                  <p className="text-sm text-slate-500 mt-2">
                    Noch keine Fahrzeuge erfasst
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Submit */}
            <Card>
              <CardContent className="pt-6 space-y-3">
                <Button 
                  type="submit"
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? "Erstellen..." : "✅ Anfrage erstellen"}
                </Button>
                <Link href="/dashboard/leads">
                  <Button variant="outline" className="w-full">
                    Abbrechen
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
