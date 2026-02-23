"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { TestDrive, Vehicle } from "@/types/database";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface TestDriveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testDrive?: TestDrive | null;
  onSaved: () => void;
}

export function TestDriveDialog({
  open,
  onOpenChange,
  testDrive,
  onSaved,
}: TestDriveDialogProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [dealerId, setDealerId] = useState<string>("");
  
  const [formData, setFormData] = useState({
    vehicle_id: "",
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    scheduled_date: "",
    scheduled_time: "",
    duration_minutes: "30",
    notes: "",
  });

  useEffect(() => {
    if (open) {
      loadVehicles();
      if (testDrive) {
        const scheduledDate = new Date(testDrive.scheduled_at);
        setFormData({
          vehicle_id: testDrive.vehicle_id || "",
          customer_name: testDrive.customer_name,
          customer_email: testDrive.customer_email || "",
          customer_phone: testDrive.customer_phone || "",
          scheduled_date: scheduledDate.toISOString().split("T")[0],
          scheduled_time: scheduledDate.toTimeString().slice(0, 5),
          duration_minutes: String(testDrive.duration_minutes),
          notes: testDrive.notes || "",
        });
      } else {
        // Reset form for new entry
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setFormData({
          vehicle_id: "",
          customer_name: "",
          customer_email: "",
          customer_phone: "",
          scheduled_date: tomorrow.toISOString().split("T")[0],
          scheduled_time: "10:00",
          duration_minutes: "30",
          notes: "",
        });
      }
    }
  }, [open, testDrive]);

  const loadVehicles = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get dealer ID
    const { data: dealer } = await supabase
      .from("dealers")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (dealer) {
      setDealerId(dealer.id);
    } else {
      const { data: teamMember } = await supabase
        .from("team_members")
        .select("dealer_id")
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();
      if (teamMember) {
        setDealerId(teamMember.dealer_id);
      }
    }

    // Get vehicles in stock
    const { data: vehiclesData } = await supabase
      .from("vehicles")
      .select("id, make, model, variant")
      .eq("status", "in_stock")
      .order("make", { ascending: true });

    if (vehiclesData) {
      setVehicles(vehiclesData as Vehicle[]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customer_name || !formData.scheduled_date || !formData.scheduled_time) {
      toast.error("Bitte alle Pflichtfelder ausfüllen");
      return;
    }

    setLoading(true);
    try {
      const scheduled_at = new Date(
        `${formData.scheduled_date}T${formData.scheduled_time}:00`
      ).toISOString();

      const payload = {
        dealer_id: dealerId,
        vehicle_id: formData.vehicle_id || null,
        customer_name: formData.customer_name,
        customer_email: formData.customer_email || null,
        customer_phone: formData.customer_phone || null,
        scheduled_at,
        duration_minutes: parseInt(formData.duration_minutes),
        notes: formData.notes || null,
        source: "manual",
      };

      let response;
      if (testDrive) {
        // Update existing
        response = await fetch(`/api/test-drives/${testDrive.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        // Create new
        response = await fetch("/api/test-drives", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Fehler beim Speichern");
      }

      toast.success(testDrive ? "Probefahrt aktualisiert" : "Probefahrt erstellt");
      onSaved();
    } catch (error) {
      console.error("Error saving test drive:", error);
      toast.error(error instanceof Error ? error.message : "Fehler beim Speichern");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {testDrive ? "Probefahrt bearbeiten" : "Neue Probefahrt"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Vehicle Selection */}
          <div className="space-y-2">
            <Label>Fahrzeug</Label>
            <Select
              value={formData.vehicle_id}
              onValueChange={(value) => setFormData({ ...formData, vehicle_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Fahrzeug wählen (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Kein Fahrzeug</SelectItem>
                {vehicles.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.make} {v.model} {v.variant || ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Customer Name */}
          <div className="space-y-2">
            <Label>Kundenname *</Label>
            <Input
              value={formData.customer_name}
              onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
              placeholder="Max Mustermann"
              required
            />
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Telefon</Label>
              <Input
                type="tel"
                value={formData.customer_phone}
                onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                placeholder="+41 79 123 45 67"
              />
            </div>
            <div className="space-y-2">
              <Label>E-Mail</Label>
              <Input
                type="email"
                value={formData.customer_email}
                onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                placeholder="max@beispiel.ch"
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Datum *</Label>
              <Input
                type="date"
                value={formData.scheduled_date}
                onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Uhrzeit *</Label>
              <Input
                type="time"
                value={formData.scheduled_time}
                onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label>Dauer</Label>
            <Select
              value={formData.duration_minutes}
              onValueChange={(value) => setFormData({ ...formData, duration_minutes: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 Minuten</SelectItem>
                <SelectItem value="30">30 Minuten</SelectItem>
                <SelectItem value="45">45 Minuten</SelectItem>
                <SelectItem value="60">1 Stunde</SelectItem>
                <SelectItem value="90">1.5 Stunden</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notizen</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Zusätzliche Informationen..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {testDrive ? "Speichern" : "Erstellen"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
