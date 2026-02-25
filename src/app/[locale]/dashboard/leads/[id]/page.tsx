"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
// API routes are used instead of direct Supabase client for impersonation support
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Lead, LeadStatus, leadStatusColors } from "@/types/leads";
import { LeadTimeline } from "@/components/leads/lead-timeline";
import { calculateLeadScore, LeadScoreBreakdown } from "@/lib/leads/scoring";
import { LeadScoreDetail } from "@/components/leads/lead-score-badge";
import { EmailComposer } from "@/components/email/email-composer";

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const t = useTranslations("leads");
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showEmailComposer, setShowEmailComposer] = useState(false);
  const [scoreBreakdown, setScoreBreakdown] = useState<LeadScoreBreakdown | null>(null);

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
    
    try {
      const response = await fetch(`/api/leads/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch lead');
      }
      
      const { lead: data, activities } = await response.json();

      // Berechne Score
      const breakdown = calculateLeadScore(data, activities || []);
      setScoreBreakdown(breakdown);

      setLead(data);
      setFirstName(data.first_name);
      setLastName(data.last_name);
      setEmail(data.email || "");
      setPhone(data.phone || "");
      setStatus(data.status);
      setNotes(data.notes || "");
      setNextFollowup(data.next_followup ? data.next_followup.split("T")[0] : "");
    } catch (error) {
      console.error("Error fetching lead:", error);
      router.push("/dashboard/leads");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    
    try {
      const response = await fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email: email || null,
          phone: phone || null,
          status,
          notes: notes || null,
          next_followup: nextFollowup || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update lead');
      }

      await fetchLead();
      alert(t("detail.saved"));
    } catch (error) {
      console.error("Error updating lead:", error);
      alert(t("detail.saveFailed"));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(t("detail.deleteConfirm"))) return;
    
    setDeleting(true);
    try {
      const response = await fetch(`/api/leads/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete lead');
      }

      router.push("/dashboard/leads");
    } catch (error) {
      console.error("Error deleting lead:", error);
      alert(t("detail.deleteFailed"));
      setDeleting(false);
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
        <div className="text-slate-500">{t("loading")}</div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-500 mb-4">{t("detail.notFound")}</p>
        <Link href="/dashboard/leads">
          <Button>{t("backToLeads")}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/dashboard/leads" className="text-slate-500 hover:text-slate-700 text-sm">
              ← {t("detail.back")}
            </Link>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
            {lead.first_name} {lead.last_name}
          </h1>
          <p className="text-slate-600 text-sm sm:text-base">
            {t("detail.inquiryFrom", { date: formatDate(lead.created_at) })} • {t(`sources.${lead.source}`)}
          </p>
        </div>
        <Badge className={`${leadStatusColors[lead.status]} text-sm sm:text-lg px-3 sm:px-4 py-1 sm:py-2 self-start`}>
          {t(`status.${lead.status}`)}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Kontaktdaten */}
          <Card>
            <CardHeader>
              <CardTitle>{t("detail.contactInfo")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">{t("detail.firstName")}</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">{t("detail.lastName")}</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">{t("detail.email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">{t("detail.phone")}</Label>
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
                <CardTitle>{t("detail.customerMessage")}</CardTitle>
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
              <CardTitle>{t("detail.yourNotes")}</CardTitle>
              <CardDescription>{t("detail.notesDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("detail.notesPlaceholder")}
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
          {/* Lead Score */}
          {scoreBreakdown && (
            <Card>
              <CardHeader>
                <CardTitle>📊 {t("detail.leadScore")}</CardTitle>
                <CardDescription>{t("detail.scoreDescription")}</CardDescription>
              </CardHeader>
              <CardContent>
                <LeadScoreDetail score={scoreBreakdown.total} breakdown={scoreBreakdown} />
              </CardContent>
            </Card>
          )}

          {/* Status & Follow-up */}
          <Card>
            <CardHeader>
              <CardTitle>{t("detail.processing")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>{t("detail.currentStatus")}</Label>
                <Select value={status} onValueChange={(value) => setStatus(value as LeadStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">{t("status.new")}</SelectItem>
                    <SelectItem value="contacted">{t("status.contacted")}</SelectItem>
                    <SelectItem value="qualified">{t("status.qualified")}</SelectItem>
                    <SelectItem value="won">{t("status.won")} ✓</SelectItem>
                    <SelectItem value="lost">{t("status.lost")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="followup">{t("detail.nextAction")}</Label>
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
                <CardTitle>🚗 {t("detail.interestedIn")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="font-semibold text-lg">
                    {lead.vehicle.make} {lead.vehicle.model}
                  </div>
                  {lead.vehicle.first_registration && (
                    <div className="text-slate-600">
                      {t("detail.year")} {new Date(lead.vehicle.first_registration).getFullYear()}
                    </div>
                  )}
                  {lead.vehicle.asking_price && (
                    <div className="text-green-600 font-semibold text-lg">
                      {formatPrice(lead.vehicle.asking_price)}
                    </div>
                  )}
                  <Link href={`/dashboard/vehicles/${lead.vehicle.id}`}>
                    <Button variant="outline" className="w-full mt-2">
                      {t("detail.toVehicle")}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* E-Mail senden */}
          {email && lead.dealer_id && (
            <Card>
              <CardHeader>
                <CardTitle>✉️ {t("detail.contactCustomer")}</CardTitle>
              </CardHeader>
              <CardContent>
                <Dialog open={showEmailComposer} onOpenChange={setShowEmailComposer}>
                  <DialogTrigger asChild>
                    <Button className="w-full" variant="outline">
                      📧 {t("detail.emailWithTemplate")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <EmailComposer
                      dealerId={lead.dealer_id}
                      recipientEmail={email}
                      recipientName={`${firstName} ${lastName}`}
                      context={{
                        kunde_name: `${firstName} ${lastName}`,
                        kunde_vorname: firstName,
                        kunde_nachname: lastName,
                        kunde_email: email,
                        fahrzeug: lead.vehicle ? `${lead.vehicle.make} ${lead.vehicle.model}` : undefined,
                        fahrzeug_marke: lead.vehicle?.make,
                        fahrzeug_modell: lead.vehicle?.model,
                        fahrzeug_jahrgang: lead.vehicle?.first_registration 
                          ? new Date(lead.vehicle.first_registration).getFullYear().toString() 
                          : undefined,
                        preis: lead.vehicle?.asking_price 
                          ? formatPrice(lead.vehicle.asking_price) 
                          : undefined,
                      }}
                      onClose={() => setShowEmailComposer(false)}
                    />
                  </DialogContent>
                </Dialog>
                <a 
                  href={`mailto:${email}`} 
                  className="block mt-2"
                >
                  <Button variant="ghost" className="w-full text-sm">
                    {t("detail.directlyTo", { email })}
                  </Button>
                </a>
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
                {saving ? t("detail.saving") : t("detail.save")}
              </Button>
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? t("detail.deleting") : t("detail.deleteLead")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
