"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LeadStatus, LeadSource, leadStatusLabels, leadStatusColors, leadSourceLabels } from "@/types/leads";
import { calculateLeadScore, LeadWithScore, LeadActivity } from "@/lib/leads/scoring";
import { LeadScoreBadge, LeadScoreCompact } from "@/components/leads/lead-score-badge";

// Relative Zeit formatieren
function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return "gerade eben";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `vor ${minutes} Min.`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `vor ${hours} Std.`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `vor ${days} ${days === 1 ? "Tag" : "Tagen"}`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `vor ${weeks} ${weeks === 1 ? "Woche" : "Wochen"}`;
  return new Date(dateString).toLocaleDateString("de-CH");
}

// Stats Card Component
function StatCard({ title, value, subtitle, color, icon }: {
  title: string;
  value: number;
  subtitle?: string;
  color: string;
  icon: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
          </div>
          <div className={`text-4xl opacity-80`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

// Lead Card Component
function LeadCard({ lead, onStatusChange }: { 
  lead: LeadWithScore; 
  onStatusChange: (id: string, status: LeadStatus) => void;
}) {
  const [showActions, setShowActions] = useState(false);

  function formatPrice(price: number) {
    return new Intl.NumberFormat("de-CH", {
      style: "currency",
      currency: "CHF",
      minimumFractionDigits: 0,
    }).format(price);
  }

  return (
    <Card className={`relative transition-all hover:shadow-md ${lead.status === "new" ? "border-l-4 border-l-blue-500" : ""}`}>
      <CardContent className="pt-4 pb-4">
        <div className="flex gap-4">
          {/* Score Badge statt Thumbnail */}
          <div className="flex flex-col items-center justify-center w-16 flex-shrink-0">
            <LeadScoreBadge 
              score={lead.score} 
              breakdown={lead.scoreBreakdown} 
              size="lg"
            />
            <span className="text-xs text-slate-500 mt-1">Score</span>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-lg truncate">
                  {lead.first_name} {lead.last_name}
                  {lead.status === "new" && (
                    <Badge className="ml-2 bg-blue-600 text-white text-xs">NEU</Badge>
                  )}
                </h3>
                {lead.vehicle && (
                  <p className="text-sm text-slate-600">
                    Interesse: {lead.vehicle.make} {lead.vehicle.model}
                    {lead.vehicle.asking_price && (
                      <span className="text-green-600 font-medium ml-2">
                        {formatPrice(lead.vehicle.asking_price)}
                      </span>
                    )}
                  </p>
                )}
              </div>
              <Badge className={leadStatusColors[lead.status]}>
                {leadStatusLabels[lead.status]}
              </Badge>
            </div>

            {/* Meta Info */}
            <div className="flex items-center gap-3 mt-2 text-sm text-slate-500">
              <span title={new Date(lead.created_at).toLocaleString("de-CH")}>
                ⏰ {timeAgo(lead.created_at)}
              </span>
              <span>📍 {leadSourceLabels[lead.source]}</span>
            </div>

            {/* Contact Buttons */}
            <div className="flex items-center gap-2 mt-3">
              {lead.phone && (
                <>
                  <a href={`tel:${lead.phone}`}>
                    <Button variant="outline" size="sm" className="h-8">
                      📞 Anrufen
                    </Button>
                  </a>
                  <a href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="h-8 text-green-600 hover:text-green-700">
                      💬 WhatsApp
                    </Button>
                  </a>
                </>
              )}
              {lead.email && (
                <a href={`mailto:${lead.email}`}>
                  <Button variant="outline" size="sm" className="h-8">
                    ✉️ E-Mail
                  </Button>
                </a>
              )}
              <div className="flex-1" />
              
              {/* Quick Actions */}
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8"
                  onClick={() => setShowActions(!showActions)}
                >
                  ⚡ Aktion
                </Button>
                {showActions && (
                  <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg z-10 py-1 min-w-[160px]">
                    <button 
                      className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
                      onClick={() => { onStatusChange(lead.id, "contacted"); setShowActions(false); }}
                    >
                      📞 In Bearbeitung
                    </button>
                    <button 
                      className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
                      onClick={() => { onStatusChange(lead.id, "qualified"); setShowActions(false); }}
                    >
                      🔥 Als Heiss markieren
                    </button>
                    <button 
                      className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
                      onClick={() => { onStatusChange(lead.id, "won"); setShowActions(false); }}
                    >
                      ✅ Verkauft
                    </button>
                    <button 
                      className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
                      onClick={() => { onStatusChange(lead.id, "lost"); setShowActions(false); }}
                    >
                      ❌ Nicht gekauft
                    </button>
                    <hr className="my-1" />
                    <Link href={`/dashboard/leads/${lead.id}`} className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50">
                      ✏️ Bearbeiten
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Message Preview */}
            {lead.message && (
              <p className="text-sm text-slate-500 mt-2 line-clamp-1 italic">
                "{lead.message}"
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Kanban Column
function KanbanColumn({ title, leads, status, color, onStatusChange, onDrop }: {
  title: string;
  leads: LeadWithScore[];
  status: LeadStatus;
  color: string;
  onStatusChange: (id: string, status: LeadStatus) => void;
  onDrop: (leadId: string, newStatus: LeadStatus) => void;
}) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData("leadId");
    if (leadId) {
      onDrop(leadId, status);
    }
  };

  return (
    <div 
      className="flex-1 min-w-[280px] max-w-[320px]"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className={`rounded-t-lg px-4 py-3 ${color}`}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{title}</h3>
          <Badge variant="secondary" className="bg-white/50">{leads.length}</Badge>
        </div>
      </div>
      <div className="bg-slate-50 rounded-b-lg p-2 min-h-[400px] space-y-2">
        {leads.map((lead) => (
          <KanbanCard key={lead.id} lead={lead} onStatusChange={onStatusChange} />
        ))}
        {leads.length === 0 && (
          <div className="text-center py-8 text-slate-400 text-sm">
            Keine Anfragen
          </div>
        )}
      </div>
    </div>
  );
}

// Kanban Card (simplified)
function KanbanCard({ lead, onStatusChange }: { lead: LeadWithScore; onStatusChange?: (id: string, status: LeadStatus) => void }) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("leadId", lead.id);
  };

  return (
    <div 
      draggable
      onDragStart={handleDragStart}
      className="bg-white rounded-lg p-3 shadow-sm border cursor-move hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium truncate">{lead.first_name} {lead.last_name}</h4>
            <LeadScoreCompact score={lead.score} />
          </div>
          {lead.vehicle && (
            <p className="text-xs text-slate-500 truncate">
              {lead.vehicle.make} {lead.vehicle.model}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
            <span>{timeAgo(lead.created_at)}</span>
            <span>•</span>
            <span>{leadSourceLabels[lead.source]}</span>
          </div>
        </div>
      </div>
      <div className="flex gap-1 mt-2">
        {lead.phone && (
          <a href={`tel:${lead.phone}`} className="text-blue-500 hover:text-blue-700 p-1">📞</a>
        )}
        {lead.email && (
          <a href={`mailto:${lead.email}`} className="text-blue-500 hover:text-blue-700 p-1">✉️</a>
        )}
        <Link href={`/dashboard/leads/${lead.id}`} className="text-slate-500 hover:text-slate-700 p-1 ml-auto">
          ✏️
        </Link>
      </div>
    </div>
  );
}

type SortOption = "date" | "score" | "name" | "price";

export default function LeadsPage() {
  const searchParams = useSearchParams();
  const locationFilter = searchParams.get("location") || "all";
  
  const [leads, setLeads] = useState<LeadWithScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "kanban">("list");
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState<LeadSource | "all">("all");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month">("all");
  const [sortBy, setSortBy] = useState<SortOption>("score");
  
  const supabase = createClient();

  useEffect(() => {
    fetchLeads();
  }, [locationFilter]);

  async function fetchLeads() {
    setLoading(true);
    
    // Lade Leads mit Fahrzeugen
    let query = supabase
      .from("leads")
      .select(`
        *,
        vehicle:vehicles(id, make, model, first_registration, asking_price)
      `)
      .order("created_at", { ascending: false });
    
    // Filter nach Standort
    if (locationFilter && locationFilter !== "all") {
      query = query.eq("location_id", locationFilter);
    }
    
    const { data: leadsData, error: leadsError } = await query;

    if (leadsError) {
      console.error("Error fetching leads:", leadsError);
      setLoading(false);
      return;
    }

    // Lade alle Aktivitäten für Score-Berechnung
    const { data: activitiesData, error: activitiesError } = await supabase
      .from("lead_activities")
      .select("id, lead_id, type, created_at");

    if (activitiesError) {
      console.error("Error fetching activities:", activitiesError);
    }

    // Gruppiere Aktivitäten nach Lead
    const activitiesByLead: Record<string, LeadActivity[]> = {};
    (activitiesData || []).forEach((activity) => {
      if (!activitiesByLead[activity.lead_id]) {
        activitiesByLead[activity.lead_id] = [];
      }
      activitiesByLead[activity.lead_id].push(activity);
    });

    // Berechne Score für jeden Lead
    const leadsWithScore: LeadWithScore[] = (leadsData || []).map((lead) => {
      const activities = activitiesByLead[lead.id] || [];
      const scoreBreakdown = calculateLeadScore(lead, activities);
      return {
        ...lead,
        score: scoreBreakdown.total,
        scoreBreakdown,
        activities,
      };
    });

    setLeads(leadsWithScore);
    setLoading(false);
  }

  async function updateLeadStatus(leadId: string, newStatus: LeadStatus) {
    const { error } = await supabase
      .from("leads")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", leadId);

    if (error) {
      console.error("Error updating lead status:", error);
    } else {
      setLeads(leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
    }
  }

  // Filter & Sort logic
  const filteredLeads = useMemo(() => {
    const filtered = leads.filter(lead => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = `${lead.first_name} ${lead.last_name}`.toLowerCase().includes(query);
        const matchesEmail = lead.email?.toLowerCase().includes(query);
        const matchesPhone = lead.phone?.includes(query);
        if (!matchesName && !matchesEmail && !matchesPhone) return false;
      }
      
      // Source filter
      if (sourceFilter !== "all" && lead.source !== sourceFilter) return false;
      
      // Status filter
      if (statusFilter !== "all" && lead.status !== statusFilter) return false;
      
      // Date filter
      if (dateFilter !== "all") {
        const leadDate = new Date(lead.created_at);
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(startOfToday);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1); // Monday
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        if (dateFilter === "today" && leadDate < startOfToday) return false;
        if (dateFilter === "week" && leadDate < startOfWeek) return false;
        if (dateFilter === "month" && leadDate < startOfMonth) return false;
      }
      
      return true;
    });

    // Sortierung (toSorted erstellt eine neue Kopie)
    const sortFns: Record<SortOption, (a: LeadWithScore, b: LeadWithScore) => number> = {
      score: (a, b) => b.score - a.score,
      date: (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      name: (a, b) => `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`),
      price: (a, b) => (b.vehicle?.asking_price || 0) - (a.vehicle?.asking_price || 0),
    };

    return [...filtered].sort(sortFns[sortBy]);
  }, [leads, searchQuery, sourceFilter, statusFilter, dateFilter, sortBy]);

  // Stats calculations
  const stats = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);

    const newToday = leads.filter(l => l.status === "new" && new Date(l.created_at) >= startOfToday).length;
    const newThisWeek = leads.filter(l => l.status === "new" && new Date(l.created_at) >= startOfWeek).length;
    const inProgress = leads.filter(l => l.status === "contacted" || l.status === "qualified").length;
    const won = leads.filter(l => l.status === "won").length;
    const lost = leads.filter(l => l.status === "lost").length;
    const total = leads.filter(l => l.status === "new").length;

    return { newToday, newThisWeek, inProgress, won, lost, total };
  }, [leads]);

  // Kanban groups
  const kanbanGroups = useMemo(() => ({
    new: filteredLeads.filter(l => l.status === "new"),
    contacted: filteredLeads.filter(l => l.status === "contacted"),
    qualified: filteredLeads.filter(l => l.status === "qualified"),
    closed: filteredLeads.filter(l => l.status === "won" || l.status === "lost"),
  }), [filteredLeads]);

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Kundenanfragen</h1>
          <p className="text-slate-600">Behalten Sie den Überblick über alle Interessenten</p>
        </div>
        <Link href="/dashboard/leads/new">
          <Button>+ Anfrage erfassen</Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Neue Anfragen" 
          value={stats.total} 
          subtitle={`${stats.newToday} heute, ${stats.newThisWeek} diese Woche`}
          color="text-blue-600"
          icon="📥"
        />
        <StatCard 
          title="In Bearbeitung" 
          value={stats.inProgress} 
          color="text-yellow-600"
          icon="⏳"
        />
        <StatCard 
          title="Gewonnen" 
          value={stats.won} 
          color="text-green-600"
          icon="🏆"
        />
        <StatCard 
          title="Verloren" 
          value={stats.lost} 
          color="text-red-600"
          icon="📉"
        />
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="🔍 Suche nach Name, E-Mail oder Telefon..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Source Filter */}
            <Select value={sourceFilter} onValueChange={(value) => setSourceFilter(value as LeadSource | "all")}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Herkunft" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Quellen</SelectItem>
                <SelectItem value="website">Eigene Website</SelectItem>
                <SelectItem value="autoscout24">AutoScout24</SelectItem>
                <SelectItem value="mobile.de">mobile.de</SelectItem>
                <SelectItem value="walkin">Vor Ort</SelectItem>
                <SelectItem value="phone">Telefonisch</SelectItem>
                <SelectItem value="other">Andere</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as LeadStatus | "all")}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="new">Offen</SelectItem>
                <SelectItem value="contacted">In Bearbeitung</SelectItem>
                <SelectItem value="qualified">Heiss 🔥</SelectItem>
                <SelectItem value="won">Verkauft</SelectItem>
                <SelectItem value="lost">Nicht gekauft</SelectItem>
              </SelectContent>
            </Select>

            {/* Date Filter */}
            <Select value={dateFilter} onValueChange={(value) => setDateFilter(value as typeof dateFilter)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Zeitraum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Zeiten</SelectItem>
                <SelectItem value="today">Heute</SelectItem>
                <SelectItem value="week">Diese Woche</SelectItem>
                <SelectItem value="month">Diesen Monat</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort By */}
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sortierung" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="score">📊 Nach Score</SelectItem>
                <SelectItem value="date">📅 Nach Datum</SelectItem>
                <SelectItem value="name">🔤 Nach Name</SelectItem>
                <SelectItem value="price">💰 Nach Preis</SelectItem>
              </SelectContent>
            </Select>

            {/* View Toggle */}
            <div className="flex items-center gap-1 border rounded-lg p-1">
              <Button 
                variant={view === "list" ? "default" : "ghost"} 
                size="sm"
                onClick={() => setView("list")}
              >
                📋 Liste
              </Button>
              <Button 
                variant={view === "kanban" ? "default" : "ghost"} 
                size="sm"
                onClick={() => setView("kanban")}
              >
                📊 Kanban
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12 text-slate-500">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          Wird geladen...
        </div>
      ) : filteredLeads.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-slate-500 mb-4">
              {leads.length === 0 
                ? "Noch keine Anfragen erfasst" 
                : "Keine Anfragen für diese Filter gefunden"}
            </p>
            {leads.length === 0 && (
              <Link href="/dashboard/leads/new">
                <Button>Erste Anfrage hinzufügen</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : view === "list" ? (
        /* List View */
        <div className="space-y-3">
          <p className="text-sm text-slate-500 mb-2">
            {filteredLeads.length} {filteredLeads.length === 1 ? "Anfrage" : "Anfragen"} gefunden
          </p>
          {filteredLeads.map((lead) => (
            <LeadCard 
              key={lead.id} 
              lead={lead} 
              onStatusChange={updateLeadStatus}
            />
          ))}
        </div>
      ) : (
        /* Kanban View */
        <div className="flex gap-4 overflow-x-auto pb-4">
          <KanbanColumn 
            title="📥 Neu" 
            leads={kanbanGroups.new}
            status="new"
            color="bg-blue-100 text-blue-800"
            onStatusChange={updateLeadStatus}
            onDrop={updateLeadStatus}
          />
          <KanbanColumn 
            title="⏳ In Bearbeitung" 
            leads={kanbanGroups.contacted}
            status="contacted"
            color="bg-yellow-100 text-yellow-800"
            onStatusChange={updateLeadStatus}
            onDrop={updateLeadStatus}
          />
          <KanbanColumn 
            title="🔥 Qualifiziert" 
            leads={kanbanGroups.qualified}
            status="qualified"
            color="bg-purple-100 text-purple-800"
            onStatusChange={updateLeadStatus}
            onDrop={updateLeadStatus}
          />
          <KanbanColumn 
            title="✅ Abgeschlossen" 
            leads={kanbanGroups.closed}
            status="won"
            color="bg-green-100 text-green-800"
            onStatusChange={updateLeadStatus}
            onDrop={updateLeadStatus}
          />
        </div>
      )}
    </div>
  );
}
