"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Calendar, 
  Clock, 
  Car, 
  User, 
  Phone, 
  Mail,
  MoreHorizontal,
  Check,
  X,
  Plus,
  Filter
} from "lucide-react";
import { TestDrive } from "@/types/database";
import { format, formatDistanceToNow, isPast } from "date-fns";
import { de } from "date-fns/locale";
import { toast } from "sonner";
import { TestDriveDialog } from "./test-drive-dialog";

const STATUS_CONFIG = {
  pending: { label: "Ausstehend", color: "bg-yellow-100 text-yellow-800" },
  confirmed: { label: "Bestätigt", color: "bg-green-100 text-green-800" },
  completed: { label: "Durchgeführt", color: "bg-blue-100 text-blue-800" },
  cancelled: { label: "Abgesagt", color: "bg-red-100 text-red-800" },
  no_show: { label: "Nicht erschienen", color: "bg-gray-100 text-gray-800" },
};

export default function TestDrivesPage() {
  const t = useTranslations("testDrives");
  const [testDrives, setTestDrives] = useState<TestDrive[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("upcoming");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTestDrive, setEditingTestDrive] = useState<TestDrive | null>(null);

  useEffect(() => {
    loadTestDrives();
  }, [filter]);

  const loadTestDrives = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter === "upcoming") {
        params.set("upcoming", "true");
      } else if (filter !== "all") {
        params.set("status", filter);
      }

      const response = await fetch(`/api/test-drives?${params}`);
      if (!response.ok) throw new Error("Failed to load");
      const data = await response.json();
      setTestDrives(data);
    } catch (error) {
      console.error("Error loading test drives:", error);
      toast.error("Fehler beim Laden der Probefahrten");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/test-drives/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Failed to update");
      toast.success("Status aktualisiert");
      loadTestDrives();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Fehler beim Aktualisieren");
    }
  };

  const deleteTestDrive = async (id: string) => {
    if (!confirm("Probefahrt wirklich löschen?")) return;
    try {
      const response = await fetch(`/api/test-drives/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete");
      toast.success("Probefahrt gelöscht");
      loadTestDrives();
    } catch (error) {
      console.error("Error deleting:", error);
      toast.error("Fehler beim Löschen");
    }
  };

  const getVehicleName = (td: TestDrive) => {
    if (td.vehicles) {
      return `${td.vehicles.make} ${td.vehicles.model}${td.vehicles.variant ? ` ${td.vehicles.variant}` : ""}`;
    }
    return "Kein Fahrzeug";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">🚗 {t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button onClick={() => { setEditingTestDrive(null); setDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          {t("new")}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {testDrives.filter(td => td.status === "pending").length}
            </div>
            <p className="text-sm text-muted-foreground">Ausstehend</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {testDrives.filter(td => td.status === "confirmed").length}
            </div>
            <p className="text-sm text-muted-foreground">Bestätigt</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {testDrives.filter(td => td.status === "completed").length}
            </div>
            <p className="text-sm text-muted-foreground">Durchgeführt</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {testDrives.length}
            </div>
            <p className="text-sm text-muted-foreground">Gesamt</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <div className="flex gap-2">
          {[
            { value: "upcoming", label: "Anstehend" },
            { value: "pending", label: "Ausstehend" },
            { value: "confirmed", label: "Bestätigt" },
            { value: "completed", label: "Durchgeführt" },
            { value: "all", label: "Alle" },
          ].map((f) => (
            <Button
              key={f.value}
              variant={filter === f.value ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Datum & Zeit</TableHead>
                <TableHead>Kunde</TableHead>
                <TableHead>Fahrzeug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Laden...
                  </TableCell>
                </TableRow>
              ) : testDrives.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Keine Probefahrten gefunden
                  </TableCell>
                </TableRow>
              ) : (
                testDrives.map((td) => (
                  <TableRow key={td.id} className={isPast(new Date(td.scheduled_at)) && td.status === "pending" ? "bg-red-50" : ""}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {format(new Date(td.scheduled_at), "dd.MM.yyyy", { locale: de })}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {format(new Date(td.scheduled_at), "HH:mm")} Uhr
                            <span className="text-xs">
                              ({formatDistanceToNow(new Date(td.scheduled_at), { locale: de, addSuffix: true })})
                            </span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {td.customer_name}
                        </div>
                        {td.customer_phone && (
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            <a href={`tel:${td.customer_phone}`} className="hover:underline">
                              {td.customer_phone}
                            </a>
                          </div>
                        )}
                        {td.customer_email && (
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            <a href={`mailto:${td.customer_email}`} className="hover:underline">
                              {td.customer_email}
                            </a>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Car className="w-4 h-4 text-muted-foreground" />
                        {getVehicleName(td)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_CONFIG[td.status]?.color || ""}>
                        {STATUS_CONFIG[td.status]?.label || td.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {td.status === "pending" && (
                            <DropdownMenuItem onClick={() => updateStatus(td.id, "confirmed")}>
                              <Check className="w-4 h-4 mr-2 text-green-600" />
                              Bestätigen
                            </DropdownMenuItem>
                          )}
                          {td.status === "confirmed" && (
                            <DropdownMenuItem onClick={() => updateStatus(td.id, "completed")}>
                              <Check className="w-4 h-4 mr-2 text-blue-600" />
                              Als durchgeführt markieren
                            </DropdownMenuItem>
                          )}
                          {["pending", "confirmed"].includes(td.status) && (
                            <DropdownMenuItem onClick={() => updateStatus(td.id, "cancelled")}>
                              <X className="w-4 h-4 mr-2 text-red-600" />
                              Absagen
                            </DropdownMenuItem>
                          )}
                          {td.status === "confirmed" && (
                            <DropdownMenuItem onClick={() => updateStatus(td.id, "no_show")}>
                              <User className="w-4 h-4 mr-2 text-gray-600" />
                              Nicht erschienen
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => { setEditingTestDrive(td); setDialogOpen(true); }}>
                            Bearbeiten
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => deleteTestDrive(td.id)}
                            className="text-red-600"
                          >
                            Löschen
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog for create/edit */}
      <TestDriveDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        testDrive={editingTestDrive}
        onSaved={() => {
          setDialogOpen(false);
          loadTestDrives();
        }}
      />
    </div>
  );
}
