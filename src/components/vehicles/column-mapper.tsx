"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

interface ColumnMapperProps {
  headers: string[];
  mapping: Record<string, string>;
  onMappingChange: (fileColumn: string, dbColumn: string) => void;
  onBack: () => void;
  onNext: () => void;
  validationErrors: ValidationError[];
}

const dbColumns = [
  { value: "", label: "-- Nicht zuordnen --" },
  { value: "make", label: "Marke *", required: true },
  { value: "model", label: "Modell *", required: true },
  { value: "variant", label: "Variante / Ausführung" },
  { value: "first_registration", label: "Erstzulassung * (YYYY-MM-DD)", required: true },
  { value: "mileage", label: "Kilometerstand *", required: true },
  { value: "fuel_type", label: "Treibstoff (petrol/diesel/electric/hybrid/other)" },
  { value: "transmission", label: "Getriebe (manual/automatic)" },
  { value: "power_kw", label: "Leistung (kW)" },
  { value: "color", label: "Farbe" },
  { value: "vin", label: "Fahrgestellnummer / VIN" },
  { value: "purchase_price", label: "Einkaufspreis" },
  { value: "asking_price", label: "Verkaufspreis *", required: true },
  { value: "description", label: "Beschreibung / Inseratetext" },
  { value: "internal_notes", label: "Interne Notizen" },
];

export function ColumnMapper({
  headers,
  mapping,
  onMappingChange,
  onBack,
  onNext,
  validationErrors,
}: ColumnMapperProps) {
  const requiredFields = dbColumns.filter((col) => col.required).map((col) => col.value);
  const mappedFields = Object.values(mapping).filter((v) => v !== "");
  const missingRequired = requiredFields.filter((field) => !mappedFields.includes(field));
  const canProceed = missingRequired.length === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spalten zuordnen</CardTitle>
        <CardDescription>
          Ordnen Sie die Spalten aus Ihrer Datei den Fahrzeugfeldern zu
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status-Übersicht */}
        <div className="flex gap-2">
          <Badge variant="secondary">{headers.length} Spalten in Datei</Badge>
          <Badge variant="secondary">{mappedFields.length} zugeordnet</Badge>
          {missingRequired.length > 0 ? (
            <Badge variant="destructive">{missingRequired.length} Pflichtfelder fehlen</Badge>
          ) : (
            <Badge variant="default" className="bg-green-600">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Alle Pflichtfelder zugeordnet
            </Badge>
          )}
        </div>

        {/* Pflichtfeld-Warnung */}
        {missingRequired.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Folgende Pflichtfelder müssen noch zugeordnet werden:{" "}
              <strong>{missingRequired.join(", ")}</strong>
            </AlertDescription>
          </Alert>
        )}

        {/* Validierungsfehler */}
        {validationErrors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {validationErrors.length} Validierungsfehler gefunden. Bitte korrigieren Sie die Datei oder das Mapping.
            </AlertDescription>
          </Alert>
        )}

        {/* Mapping-Formular */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Spalten aus Ihrer Datei:</h4>
          <div className="grid gap-4">
            {headers.map((header, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="flex-1">
                  <Label className="text-sm font-normal">
                    <Badge variant="outline" className="mr-2">
                      {header}
                    </Badge>
                  </Label>
                </div>
                <div className="flex-1">
                  <Select
                    value={mapping[header] || ""}
                    onValueChange={(value) => onMappingChange(header, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Feld auswählen..." />
                    </SelectTrigger>
                    <SelectContent>
                      {dbColumns.map((col) => (
                        <SelectItem key={col.value} value={col.value}>
                          {col.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hilfe */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-sm mb-2">💡 Hinweise:</h4>
          <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
            <li>Mit * markierte Felder sind Pflichtfelder</li>
            <li>Treibstoff: petrol, diesel, electric, hybrid oder other</li>
            <li>Getriebe: manual oder automatic</li>
            <li>Datum-Format: YYYY-MM-DD (z.B. 2020-05-15)</li>
            <li>Nicht benötigte Spalten können auf "Nicht zuordnen" bleiben</li>
          </ul>
        </div>

        {/* Aktionen */}
        <div className="flex gap-4">
          <Button variant="outline" onClick={onBack}>
            Zurück
          </Button>
          <Button onClick={onNext} className="flex-1" disabled={!canProceed}>
            {canProceed ? "Validieren & Import vorbereiten" : "Pflichtfelder zuordnen"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
