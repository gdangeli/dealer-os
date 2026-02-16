"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { ColumnMapper } from "./column-mapper";
import { VehiclePreview } from "./vehicle-preview";

interface ParsedRow {
  [key: string]: string | number | null;
}

interface MappedVehicle {
  make?: string;
  model?: string;
  variant?: string;
  first_registration?: string;
  mileage?: number;
  fuel_type?: string;
  transmission?: string;
  power_kw?: number;
  color?: string;
  vin?: string;
  purchase_price?: number;
  asking_price?: number;
  description?: string;
  internal_notes?: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: ValidationError[];
}

interface VehicleImportProps {
  dealerId: string;
}

type ImportStep = "upload" | "preview" | "mapping" | "import" | "complete";

export function VehicleImport({ dealerId }: VehicleImportProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<ImportStep>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [mappedVehicles, setMappedVehicles] = useState<MappedVehicle[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const fileType = selectedFile.name.split(".").pop()?.toLowerCase();
    if (!["csv", "xlsx", "xls"].includes(fileType || "")) {
      setError("Bitte wählen Sie eine CSV oder Excel-Datei aus.");
      return;
    }

    setFile(selectedFile);
    setError(null);
  };

  const parseFile = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const fileType = file.name.split(".").pop()?.toLowerCase();

      if (fileType === "csv") {
        // CSV Parsing mit PapaParse
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.data.length === 0) {
              setError("Die Datei enthält keine Daten.");
              setLoading(false);
              return;
            }
            
            const data = results.data as ParsedRow[];
            const fileHeaders = Object.keys(data[0] || {});
            
            setParsedData(data);
            setHeaders(fileHeaders);
            autoMapColumns(fileHeaders);
            setStep("preview");
            setLoading(false);
          },
          error: (err) => {
            setError(`CSV-Fehler: ${err.message}`);
            setLoading(false);
          },
        });
      } else {
        // Excel Parsing mit XLSX
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: "binary" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, {
              raw: false,
              defval: null,
            }) as ParsedRow[];

            if (jsonData.length === 0) {
              setError("Die Excel-Datei enthält keine Daten.");
              setLoading(false);
              return;
            }

            const fileHeaders = Object.keys(jsonData[0] || {});
            
            setParsedData(jsonData);
            setHeaders(fileHeaders);
            autoMapColumns(fileHeaders);
            setStep("preview");
            setLoading(false);
          } catch (err) {
            setError(`Excel-Fehler: ${err instanceof Error ? err.message : "Unbekannter Fehler"}`);
            setLoading(false);
          }
        };
        reader.onerror = () => {
          setError("Fehler beim Lesen der Datei.");
          setLoading(false);
        };
        reader.readAsBinaryString(file);
      }
    } catch (err) {
      setError(`Fehler beim Parsen: ${err instanceof Error ? err.message : "Unbekannter Fehler"}`);
      setLoading(false);
    }
  };

  const autoMapColumns = (fileHeaders: string[]) => {
    const mapping: Record<string, string> = {};
    
    // Mapping-Regeln (case-insensitive)
    const mappingRules: Record<string, string[]> = {
      make: ["marke", "make", "brand", "hersteller"],
      model: ["modell", "model"],
      variant: ["variant", "variante", "ausführung", "ausfuehrung"],
      first_registration: ["erstzulassung", "erstzu", "first_registration", "registration", "ez"],
      mileage: ["kilometerstand", "km", "mileage", "kilometer"],
      fuel_type: ["treibstoff", "kraftstoff", "fuel", "antrieb", "fuel_type"],
      transmission: ["getriebe", "transmission", "schaltung"],
      power_kw: ["leistung", "power", "kw", "power_kw"],
      color: ["farbe", "color", "lackierung"],
      vin: ["vin", "fahrgestellnummer", "chassis"],
      purchase_price: ["einkaufspreis", "ek", "purchase", "purchase_price"],
      asking_price: ["verkaufspreis", "vk", "preis", "price", "asking_price"],
      description: ["beschreibung", "description", "text", "inseratetext"],
      internal_notes: ["notizen", "notes", "internal", "internal_notes", "bemerkung"],
    };

    fileHeaders.forEach((header) => {
      const normalizedHeader = header.toLowerCase().trim();
      
      for (const [field, keywords] of Object.entries(mappingRules)) {
        if (keywords.some((keyword) => normalizedHeader.includes(keyword))) {
          mapping[header] = field;
          break;
        }
      }
    });

    setColumnMapping(mapping);
  };

  const handleMappingChange = (fileColumn: string, dbColumn: string) => {
    setColumnMapping((prev) => ({
      ...prev,
      [fileColumn]: dbColumn,
    }));
  };

  const proceedToMapping = () => {
    setStep("mapping");
  };

  const validateAndPrepare = () => {
    const errors: ValidationError[] = [];
    const vehicles: MappedVehicle[] = [];

    parsedData.forEach((row, index) => {
      const vehicle: MappedVehicle = {};
      
      // Pflichtfelder
      const requiredFields = ["make", "model", "first_registration", "mileage", "asking_price"];
      const missingFields: string[] = [];

      Object.entries(columnMapping).forEach(([fileCol, dbCol]) => {
        const value = row[fileCol];
        
        if (value !== null && value !== undefined && value !== "") {
          (vehicle as any)[dbCol] = value;
        }
      });

      // Validierung Pflichtfelder
      requiredFields.forEach((field) => {
        if (!vehicle[field as keyof MappedVehicle]) {
          missingFields.push(field);
        }
      });

      if (missingFields.length > 0) {
        errors.push({
          row: index + 2, // +2 wegen Header und 1-basiert
          field: missingFields.join(", "),
          message: "Pflichtfeld fehlt",
        });
      }

      // Validierung Zahlenfelder
      if (vehicle.mileage && isNaN(Number(vehicle.mileage))) {
        errors.push({
          row: index + 2,
          field: "mileage",
          message: "Kilometerstand muss eine Zahl sein",
        });
      }

      if (vehicle.asking_price && isNaN(Number(vehicle.asking_price))) {
        errors.push({
          row: index + 2,
          field: "asking_price",
          message: "Verkaufspreis muss eine Zahl sein",
        });
      }

      // Validierung Datum
      if (vehicle.first_registration) {
        const datePattern = /^\d{4}-\d{2}-\d{2}$/;
        if (!datePattern.test(String(vehicle.first_registration))) {
          errors.push({
            row: index + 2,
            field: "first_registration",
            message: "Datum muss Format YYYY-MM-DD haben",
          });
        }
      }

      // Validierung Enums
      const validFuelTypes = ["petrol", "diesel", "electric", "hybrid", "other"];
      if (vehicle.fuel_type && !validFuelTypes.includes(String(vehicle.fuel_type).toLowerCase())) {
        errors.push({
          row: index + 2,
          field: "fuel_type",
          message: `Treibstoff muss einer sein von: ${validFuelTypes.join(", ")}`,
        });
      }

      const validTransmissions = ["manual", "automatic"];
      if (vehicle.transmission && !validTransmissions.includes(String(vehicle.transmission).toLowerCase())) {
        errors.push({
          row: index + 2,
          field: "transmission",
          message: `Getriebe muss sein: manual oder automatic`,
        });
      }

      vehicles.push(vehicle);
    });

    setValidationErrors(errors);
    setMappedVehicles(vehicles);

    if (errors.length > 0) {
      setError(`${errors.length} Validierungsfehler gefunden. Bitte korrigieren Sie die Datei.`);
    } else {
      setError(null);
      setStep("import");
    }
  };

  const executeImport = async () => {
    setLoading(true);
    setImportProgress(0);
    
    const supabase = createClient();
    let successCount = 0;
    let failedCount = 0;
    const errors: ValidationError[] = [];

    const batchSize = 10;
    const batches = [];
    for (let i = 0; i < mappedVehicles.length; i += batchSize) {
      batches.push(mappedVehicles.slice(i, i + batchSize));
    }

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      
      const vehiclesToInsert = batch.map((vehicle) => ({
        dealer_id: dealerId,
        make: vehicle.make || "",
        model: vehicle.model || "",
        variant: vehicle.variant || null,
        first_registration: vehicle.first_registration || null,
        mileage: Number(vehicle.mileage) || 0,
        fuel_type: vehicle.fuel_type?.toLowerCase() || "other",
        transmission: vehicle.transmission?.toLowerCase() || "manual",
        power_kw: vehicle.power_kw ? Number(vehicle.power_kw) : null,
        color: vehicle.color || null,
        vin: vehicle.vin || null,
        purchase_price: vehicle.purchase_price ? Number(vehicle.purchase_price) : null,
        asking_price: Number(vehicle.asking_price) || 0,
        description: vehicle.description || null,
        internal_notes: vehicle.internal_notes || null,
        status: "in_stock" as const,
        acquired_at: new Date().toISOString(),
      }));

      try {
        const { error: insertError } = await supabase
          .from("vehicles")
          .insert(vehiclesToInsert);

        if (insertError) {
          failedCount += batch.length;
          errors.push({
            row: batchIndex * batchSize + 1,
            field: "batch",
            message: insertError.message,
          });
        } else {
          successCount += batch.length;
        }
      } catch (err) {
        failedCount += batch.length;
        errors.push({
          row: batchIndex * batchSize + 1,
          field: "batch",
          message: err instanceof Error ? err.message : "Unbekannter Fehler",
        });
      }

      setImportProgress(Math.round(((batchIndex + 1) / batches.length) * 100));
    }

    setImportResult({
      success: successCount,
      failed: failedCount,
      errors,
    });

    setLoading(false);
    setStep("complete");
  };

  const resetImport = () => {
    setStep("upload");
    setFile(null);
    setParsedData([]);
    setHeaders([]);
    setColumnMapping({});
    setMappedVehicles([]);
    setValidationErrors([]);
    setImportProgress(0);
    setImportResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const goBack = () => {
    if (step === "preview") setStep("upload");
    if (step === "mapping") setStep("preview");
    if (step === "import") setStep("mapping");
  };

  return (
    <div className="space-y-6">
      {/* Schritt-Anzeige */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === "upload" ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}>
                1
              </div>
              <span className="font-medium">Datei hochladen</span>
            </div>
            <div className="flex-1 h-1 mx-4 bg-gray-200">
              <div
                className="h-full bg-blue-600 transition-all"
                style={{
                  width: step === "upload" ? "0%" : step === "preview" ? "33%" : step === "mapping" ? "66%" : "100%",
                }}
              />
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                ["preview", "mapping", "import", "complete"].includes(step) ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}>
                2
              </div>
              <span className="font-medium">Vorschau & Mapping</span>
            </div>
            <div className="flex-1 h-1 mx-4 bg-gray-200">
              <div
                className="h-full bg-blue-600 transition-all"
                style={{
                  width: ["import", "complete"].includes(step) ? "100%" : "0%",
                }}
              />
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                ["import", "complete"].includes(step) ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}>
                3
              </div>
              <span className="font-medium">Import</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fehleranzeige */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Schritt 1: Upload */}
      {step === "upload" && (
        <Card>
          <CardHeader>
            <CardTitle>Datei auswählen</CardTitle>
            <CardDescription>
              Laden Sie eine CSV oder Excel-Datei (.xlsx, .xls) mit Ihren Fahrzeugdaten hoch
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
              <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <div className="space-y-2">
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" />
                    Datei auswählen
                  </Button>
                </Label>
                <input
                  ref={fileInputRef}
                  id="file-upload"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {file && (
                  <p className="text-sm text-gray-600 mt-2">
                    Ausgewählt: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-sm mb-2">💡 Tipps für erfolgreichen Import:</h4>
              <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                <li>Erste Zeile sollte Spaltenüberschriften enthalten</li>
                <li>Pflichtfelder: Marke, Modell, Erstzulassung, Kilometerstand, Verkaufspreis</li>
                <li>Datumsformat: YYYY-MM-DD (z.B. 2020-05-15)</li>
                <li>Treibstoff: petrol, diesel, electric, hybrid, oder other</li>
                <li>Getriebe: manual oder automatic</li>
              </ul>
            </div>

            {file && (
              <Button onClick={parseFile} disabled={loading} className="w-full">
                {loading ? "Datei wird gelesen..." : "Weiter zur Vorschau"}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Schritt 2a: Vorschau */}
      {step === "preview" && (
        <VehiclePreview
          data={parsedData.slice(0, 10)}
          headers={headers}
          totalRows={parsedData.length}
          onBack={goBack}
          onNext={proceedToMapping}
        />
      )}

      {/* Schritt 2b: Mapping */}
      {step === "mapping" && (
        <ColumnMapper
          headers={headers}
          mapping={columnMapping}
          onMappingChange={handleMappingChange}
          onBack={goBack}
          onNext={validateAndPrepare}
          validationErrors={validationErrors}
        />
      )}

      {/* Schritt 3: Import */}
      {step === "import" && (
        <Card>
          <CardHeader>
            <CardTitle>Import starten</CardTitle>
            <CardDescription>
              {mappedVehicles.length} Fahrzeuge bereit zum Import
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!loading && importProgress === 0 && (
              <>
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    Alle Validierungen erfolgreich. Sie können nun den Import starten.
                  </AlertDescription>
                </Alert>
                <div className="flex gap-4">
                  <Button onClick={executeImport} className="flex-1">
                    Import starten
                  </Button>
                  <Button variant="outline" onClick={goBack}>
                    Zurück
                  </Button>
                </div>
              </>
            )}

            {loading && (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Import läuft...</span>
                    <span>{importProgress}%</span>
                  </div>
                  <Progress value={importProgress} />
                </div>
                <p className="text-sm text-gray-600">
                  Bitte warten Sie, während die Fahrzeuge importiert werden.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Schritt 4: Abschluss */}
      {step === "complete" && importResult && (
        <Card>
          <CardHeader>
            <CardTitle>Import abgeschlossen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Erfolgreich importiert</span>
                </div>
                <p className="text-3xl font-bold text-green-600">{importResult.success}</p>
              </div>
              {importResult.failed > 0 && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <span className="font-medium">Fehlgeschlagen</span>
                  </div>
                  <p className="text-3xl font-bold text-red-600">{importResult.failed}</p>
                </div>
              )}
            </div>

            {importResult.errors.length > 0 && (
              <div className="border border-red-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                <h4 className="font-medium mb-2">Fehlerprotokoll:</h4>
                <div className="space-y-2">
                  {importResult.errors.map((error, index) => (
                    <div key={index} className="text-sm">
                      <Badge variant="destructive" className="mr-2">
                        Zeile {error.row}
                      </Badge>
                      <span className="text-gray-700">
                        {error.field}: {error.message}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <Button onClick={() => router.push("/dashboard/vehicles")} className="flex-1">
                Zu den Fahrzeugen
              </Button>
              <Button variant="outline" onClick={resetImport}>
                Weitere Fahrzeuge importieren
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
