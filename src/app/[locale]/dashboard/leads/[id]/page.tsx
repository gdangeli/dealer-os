"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lead, LeadStatus, leadStatusLabels, leadStatusColors, leadSourceLabels } from "@/types/leads";
import { LeadTimeline } from "@/components/leads/lead-timeline";

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const supabase = createClient();

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<LeadStatus>("new");
  const [notes, setNotes] = useState("");
  const [nextFollowup, setNextFollowup] = useState("");

  useEffect(() => {
    fetchLead();
  }, [id]);

  async function fetchLead() {
    setLoading(true);
    
    const { data, error } = await supabase
      .from("leads")
      .select(`
        *,
        vehicle:vehicles(id, make, model, first_registration, asking_price)
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching lead:", error);
      router.push("/dashboard/leads");
      return;
    }

    setLead(data);
    setFirstName(data.first_name);
    setLastName(data.last_name);
    setEmail(data.email || "");
    setPhone(data.phone || "");
    setStatus(data.status);
    setNotes(data.notes || "");
    setNextFollowup(data.next_followup ? data.next_followup.split("T")[0] : "");
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    
    const { error } = await supabase
      .from("leads")
      .update({
        first_name: firstName,
        last_name: lastName,
        email: email || null,
        phone: phone || null,
        status,
        notes: notes || null,
        next_followup: nextFollowup || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("Error updating lead:", error);
      alert("Speichern fehlgeschlagen. Bitte erneut versuchen.");
    } else {
      await fetchLead();
      alert("Gespeichert!");
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!confirm("Diese Anfrage endgültig löschen?")) return;
    
    setDeleting(true);
    const { error } = await supabase
      .from("leads")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting lead:", error);
      alert("Löschen fehlgeschlagen. Bitte erneut versuchen.");
      setDeleting(false);
    } else {
      router.push("/dashboard/leads");
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("de-CH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat("de-CH", {
      style: "currency",
      currency: "CHF",
      minimumFractionDigits: 0,
    }).format(price);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Wird geladen...</div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-500 mb-4">Diese Anfrage wurde nicht gefunden oder gelöscht.</p>
        <Link href="/dashboard/leads">
          <Button>Zurück zu den Anfragen</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/dashboard/leads" className="text-slate-500 hover:text-slate-700">
              ← Zurück
            </Link>
          </div>
          <h1 className="text-3xl font-bold">
            {lead.first_name} {lead.last_name}
          </h1>
          <p className="text-slate-600">
            Anfrage vom {formatDate(lead.created_at)} • {leadSourceLabels[lead.source]}
          </p>
        </div>
        <Badge className={`${leadStatusColors[lead.status]} text-lg px-4 py-2`}>
          {leadStatusLabels[lead.status]}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          {/* Kontaktdaten */}
          <Card>
            <CardHeader>
              <CardTitle>Kontaktinformationen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Vorname</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Nachname</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
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
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Kundennachricht */}
          {lead.message && (
            <Card>
              <CardHeader>
                <CardTitle>Kundenanliegen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-50 p-4 rounded-lg whitespace-pre-wrap">
                  {lead.message}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notizen */}
          <Card>
            <CardHeader>
              <CardTitle>Ihre Notizen</CardTitle>
              <CardDescription>Nur intern sichtbar – für Ihre Dokumentation</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="z.B. Probefahrt vereinbart für Samstag 10 Uhr..."
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Timeline */}
          {lead.dealer_id && (
            <LeadTimeline leadId={id} dealerId={lead.dealer_id} />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Follow-up */}
          <Card>
            <CardHeader>
              <CardTitle>Bearbeitung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Aktueller Status</Label>
                <Select value={status} onValueChange={(value) => setStatus(value as LeadStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Offen</SelectItem>
                    <SelectItem value="contacted">In Bearbeitung</SelectItem>
                    <SelectItem value="qualified">Heiss 🔥</SelectItem>
                    <SelectItem value="won">Verkauft ✓</SelectItem>
                    <SelectItem value="lost">Nicht gekauft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="followup">Nächste Aktion am</Label>
                <Input
                  id="followup"
                  type="date"
                  value={nextFollowup}
                  onChange={(e) => setNextFollowup(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Verknüpftes Fahrzeug */}
          {lead.vehicle && (
            <Card>
              <CardHeader>
                <CardTitle>🚗 Interessiert an</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="font-semibold text-lg">
                    {lead.vehicle.make} {lead.vehicle.model}
                  </div>
                  {lead.vehicle.first_registration && (
                    <div className="text-slate-600">
                      Jahrgang {new Date(lead.vehicle.first_registration).getFullYear()}
                    </div>
                  )}
                  {lead.vehicle.asking_price && (
                    <div className="text-green-600 font-semibold text-lg">
                      {formatPrice(lead.vehicle.asking_price)}
                    </div>
                  )}
                  <Link href={`/dashboard/vehicles/${lead.vehicle.id}`}>
                    <Button variant="outline" className="w-full mt-2">
                      Zum Fahrzeug
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardContent className="pt-6 space-y-3">
              <Button 
                className="w-full" 
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Wird gespeichert..." : "Speichern"}
              </Button>
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Wird gelöscht..." : "Anfrage löschen"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
