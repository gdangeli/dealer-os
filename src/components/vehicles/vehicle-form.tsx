"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Vehicle,
  VehicleFormData,
  VehicleStatus,
  FuelType,
  Transmission,
  fuelTypeLabels,
  transmissionLabels,
  statusLabels,
} from "@/types/vehicle";
import { createClient } from "@/lib/supabase/client";

interface VehicleFormProps {
  vehicle?: Vehicle;
  dealerId: string;
}

const initialFormData: VehicleFormData = {
  make: "",
  model: "",
  variant: "",
  first_registration: "",
  mileage: 0,
  fuel_type: "petrol",
  transmission: "manual",
  power_kw: null,
  color: "",
  vin: "",
  purchase_price: null,
  asking_price: 0,
  description: "",
  internal_notes: "",
  status: "in_stock",
};

export function VehicleForm({ vehicle, dealerId }: VehicleFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const isEditing = !!vehicle;

  const [formData, setFormData] = useState<VehicleFormData>(
    vehicle
      ? {
          make: vehicle.make,
          model: vehicle.model,
          variant: vehicle.variant || "",
          first_registration: vehicle.first_registration || "",
          mileage: vehicle.mileage || 0,
          fuel_type: (vehicle.fuel_type as FuelType) || "petrol",
          transmission: (vehicle.transmission as Transmission) || "manual",
          power_kw: vehicle.power_kw,
          color: vehicle.color || "",
          vin: vehicle.vin || "",
          purchase_price: vehicle.purchase_price,
          asking_price: vehicle.asking_price || 0,
          description: vehicle.description || "",
          internal_notes: vehicle.internal_notes || "",
          status: vehicle.status,
        }
      : initialFormData
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? null : Number(value)) : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const vehicleData = {
        dealer_id: dealerId,
        make: formData.make,
        model: formData.model,
        variant: formData.variant || null,
        first_registration: formData.first_registration || null,
        mileage: formData.mileage,
        fuel_type: formData.fuel_type,
        transmission: formData.transmission,
        power_kw: formData.power_kw,
        color: formData.color || null,
        vin: formData.vin || null,
        purchase_price: formData.purchase_price,
        asking_price: formData.asking_price,
        description: formData.description || null,
        internal_notes: formData.internal_notes || null,
        status: formData.status,
      };

      if (isEditing) {
        const { error: updateError } = await supabase
          .from("vehicles")
          .update(vehicleData)
          .eq("id", vehicle.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("vehicles")
          .insert(vehicleData);

        if (insertError) throw insertError;
      }

      router.push("/dashboard/vehicles");
      router.refresh();
    } catch (err) {
      console.error("Error saving vehicle:", err);
      setError(
        err instanceof Error ? err.message : "Fehler beim Speichern"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Basis-Informationen */}
      <Card>
        <CardHeader>
          <CardTitle>Grunddaten</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="make">Marke *</Label>
            <Input
              id="make"
              name="make"
              value={formData.make}
              onChange={handleChange}
              placeholder="VW, BMW, Audi..."
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="model">Modell *</Label>
            <Input
              id="model"
              name="model"
              value={formData.model}
              onChange={handleChange}
              placeholder="Golf, 3er, A4..."
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="variant">Ausführung</Label>
            <Input
              id="variant"
              name="variant"
              value={formData.variant}
              onChange={handleChange}
              placeholder="GTI, Touring, Avant..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Technische Daten */}
      <Card>
        <CardHeader>
          <CardTitle>Technische Daten</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_registration">Erstzulassung *</Label>
            <Input
              id="first_registration"
              name="first_registration"
              type="date"
              value={formData.first_registration}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mileage">Kilometerstand *</Label>
            <Input
              id="mileage"
              name="mileage"
              type="number"
              value={formData.mileage || ""}
              onChange={handleChange}
              placeholder="z.B. 45000"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="power_kw">Leistung (kW)</Label>
            <Input
              id="power_kw"
              name="power_kw"
              type="number"
              value={formData.power_kw ?? ""}
              onChange={handleChange}
              placeholder="z.B. 140"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fuel_type">Treibstoff *</Label>
            <Select
              value={formData.fuel_type}
              onValueChange={(value) => handleSelectChange("fuel_type", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(fuelTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="transmission">Getriebe *</Label>
            <Select
              value={formData.transmission}
              onValueChange={(value) =>
                handleSelectChange("transmission", value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(transmissionLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="color">Farbe</Label>
            <Input
              id="color"
              name="color"
              value={formData.color}
              onChange={handleChange}
              placeholder="z.B. Schwarz Metallic"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vin">Fahrgestellnummer (VIN)</Label>
            <Input
              id="vin"
              name="vin"
              value={formData.vin}
              onChange={handleChange}
              placeholder="Optional"
            />
          </div>
        </CardContent>
      </Card>

      {/* Preise */}
      <Card>
        <CardHeader>
          <CardTitle>Preise</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="purchase_price">Einkaufspreis (CHF)</Label>
            <Input
              id="purchase_price"
              name="purchase_price"
              type="number"
              value={formData.purchase_price ?? ""}
              onChange={handleChange}
              placeholder="z.B. 18000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="asking_price">Verkaufspreis (CHF) *</Label>
            <Input
              id="asking_price"
              name="asking_price"
              type="number"
              value={formData.asking_price || ""}
              onChange={handleChange}
              placeholder="z.B. 22900"
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Beschreibungen */}
      <Card>
        <CardHeader>
          <CardTitle>Beschreibungen</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="description">Öffentliche Beschreibung</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Beschreibung für das Inserat..."
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="internal_notes">Interne Notizen</Label>
            <Textarea
              id="internal_notes"
              name="internal_notes"
              value={formData.internal_notes}
              onChange={handleChange}
              placeholder="Notizen nur für interne Zwecke..."
              rows={3}
              className="bg-yellow-50"
            />
          </div>
        </CardContent>
      </Card>

      {/* Status (nur bei Bearbeitung) */}
      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-w-xs">
              <Label htmlFor="status">Fahrzeug-Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  handleSelectChange("status", value as VehicleStatus)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Aktionen */}
      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading
            ? "Speichern..."
            : isEditing
            ? "Änderungen speichern"
            : "Fahrzeug hinzufügen"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/vehicles")}
        >
          Abbrechen
        </Button>
      </div>
    </form>
  );
}
