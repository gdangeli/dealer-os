"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lead, LeadStatus, leadStatusLabels, leadStatusColors, leadSourceLabels } from "@/types/leads";

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const supabase = createClient();

  useEffect(() => {
    fetchLeads();
  }, [statusFilter]);

  async function fetchLeads() {
    setLoading(true);
    
    let query = supabase
      .from("leads")
      .select(`
        *,
        vehicle:vehicles(id, make, model, first_registration, asking_price)
      `)
      .order("created_at", { ascending: false });

    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching leads:", error);
    } else {
      setLeads(data || []);
    }
    setLoading(false);
  }

  const newLeadsCount = leads.filter(l => l.status === "new").length;

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("de-CH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  function formatVehicle(vehicle: Lead["vehicle"]) {
    if (!vehicle) return "-";
    const year = vehicle.first_registration ? new Date(vehicle.first_registration).getFullYear() : "";
    return `${vehicle.make} ${vehicle.model}${year ? ` (${year})` : ""}`;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Kundenanfragen</h1>
            <p className="text-slate-600">Behalten Sie den Überblick über alle Interessenten</p>
          </div>
          {newLeadsCount > 0 && (
            <Badge className="bg-blue-600 text-white text-lg px-3 py-1">
              {newLeadsCount} offen
            </Badge>
          )}
        </div>
        <Link href="/dashboard/leads/new">
          <Button>+ Anfrage erfassen</Button>
        </Link>
      </div>

      {/* Filter */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Anzeigen:</span>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as LeadStatus | "all")}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Alle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Anfragen</SelectItem>
                <SelectItem value="new">Offen</SelectItem>
                <SelectItem value="contacted">In Bearbeitung</SelectItem>
                <SelectItem value="qualified">Heiss</SelectItem>
                <SelectItem value="won">Abgeschlossen</SelectItem>
                <SelectItem value="lost">Nicht gekauft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lead Table */}
      <Card>
        <CardHeader>
          <CardTitle>Übersicht</CardTitle>
          <CardDescription>
            {leads.length} {leads.length === 1 ? "Anfrage" : "Anfragen"} gefunden
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-slate-500">Wird geladen...</div>
          ) : leads.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500 mb-4">Noch keine Anfragen erfasst</p>
              <Link href="/dashboard/leads/new">
                <Button>Erste Anfrage hinzufügen</Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Eingegangen</TableHead>
                  <TableHead>Interessent</TableHead>
                  <TableHead>Fahrzeug</TableHead>
                  <TableHead>Herkunft</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Nächste Aktion</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id} className={lead.status === "new" ? "bg-blue-50" : ""}>
                    <TableCell>{formatDate(lead.created_at)}</TableCell>
                    <TableCell className="font-medium">
                      {lead.first_name} {lead.last_name}
                      {lead.status === "new" && (
                        <Badge className="ml-2 bg-blue-600 text-white text-xs">NEU</Badge>
                      )}
                    </TableCell>
                    <TableCell>{formatVehicle(lead.vehicle)}</TableCell>
                    <TableCell>{leadSourceLabels[lead.source]}</TableCell>
                    <TableCell>
                      <Badge className={leadStatusColors[lead.status]}>
                        {leadStatusLabels[lead.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {lead.next_followup ? formatDate(lead.next_followup) : "-"}
                    </TableCell>
                    <TableCell>
                      <Link href={`/dashboard/leads/${lead.id}`}>
                        <Button variant="outline" size="sm">
                          Bearbeiten
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
