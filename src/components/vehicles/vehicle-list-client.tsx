"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Vehicle,
  statusLabels,
  statusColors,
  fuelTypeLabels,
  FuelType,
} from "@/types/vehicle";
import { Download, ChevronDown, FileSpreadsheet, ImageIcon } from "lucide-react";

// Extended type for vehicle with images
interface VehicleImage {
  id: string;
  url: string;
  position: number;
  is_main: boolean;
}

interface VehicleWithImages extends Vehicle {
  vehicle_images?: VehicleImage[];
}

interface VehicleListClientProps {
  vehicles: VehicleWithImages[];
}

export function VehicleListClient({ vehicles }: VehicleListClientProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);

  // Alle auswählbaren Fahrzeuge (nur in_stock und reserved)
  const selectableVehicles = vehicles.filter(
    (v) => v.status === "in_stock" || v.status === "reserved"
  );
  const allSelectableIds = selectableVehicles.map((v) => v.id);

  // Alle ausgewählt?
  const allSelected =
    allSelectableIds.length > 0 &&
    allSelectableIds.every((id) => selectedIds.has(id));
  const someSelected = selectedIds.size > 0 && !allSelected;

  // Toggle einzelnes Fahrzeug
  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // Alle togglen
  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(allSelectableIds));
    }
  };

  // CSV Export
  type ExportFormat = "autoscout24" | "tutti" | "full";
  
  const formatFileNames: Record<ExportFormat, string> = {
    autoscout24: "autoscout24_export",
    tutti: "tutti_export",
    full: "fahrzeuge_komplett",
  };

  const handleExport = async (format: ExportFormat, includeAll: boolean = false) => {
    setIsExporting(true);
    try {
      const response = await fetch(`/api/export/${format}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vehicleIds: selectedIds.size > 0 ? Array.from(selectedIds) : null,
          includeAll, // Für Full-Export: auch verkaufte inkludieren
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Export fehlgeschlagen");
      }

      // Download trigger
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${formatFileNames[format]}_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export error:", error);
      alert(error instanceof Error ? error.message : "Export fehlgeschlagen");
    } finally {
      setIsExporting(false);
    }
  };

  // Standzeit berechnen
  const calculateDaysOnLot = (createdAt: string): number => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Preis formatieren
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("de-CH", {
      style: "currency",
      currency: "CHF",
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Jahr aus Erstzulassung
  const getYear = (dateStr: string | null): string => {
    if (!dateStr) return "";
    return new Date(dateStr).getFullYear().toString();
  };

  if (vehicles.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">🚗</div>
        <h3 className="text-lg font-medium text-slate-900">
          Noch keine Fahrzeuge
        </h3>
        <p className="text-slate-600 mt-1">
          Erfassen Sie jetzt Ihr erstes Fahrzeug.
        </p>
        <Link href="/dashboard/vehicles/new">
          <Button className="mt-4">+ Erstes Fahrzeug erfassen</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Export Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-slate-600">
          {selectedIds.size > 0 ? (
            <span className="font-medium text-slate-900">
              {selectedIds.size} Fahrzeug{selectedIds.size !== 1 ? "e" : ""} ausgewählt
            </span>
          ) : (
            <span>
              {selectableVehicles.length} Fahrzeug{selectableVehicles.length !== 1 ? "e" : ""} exportierbar
            </span>
          )}
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" disabled={isExporting}>
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? "Exportiere..." : "Exportieren"}
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => handleExport("autoscout24")}>
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              AutoScout24 CSV
              {selectedIds.size > 0 && (
                <span className="ml-2 text-slate-500">
                  ({selectedIds.size})
                </span>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("tutti")}>
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              tutti.ch CSV
              {selectedIds.size > 0 && (
                <span className="ml-2 text-slate-500">
                  ({selectedIds.size})
                </span>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("full", true)}>
              <Download className="w-4 h-4 mr-2" />
              Alle Daten (Backup)
              {selectedIds.size > 0 && (
                <span className="ml-2 text-slate-500">
                  ({selectedIds.size})
                </span>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tabelle */}
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <Table className="min-w-[600px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-10 sm:w-12">
                <Checkbox
                  checked={allSelected}
                  // @ts-expect-error - indeterminate ist ein gültiges HTML Attribut
                  indeterminate={someSelected}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Alle auswählen"
                />
              </TableHead>
              <TableHead className="w-12 sm:w-16">Bild</TableHead>
              <TableHead>Fahrzeug</TableHead>
              <TableHead>Preis</TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
              <TableHead className="hidden md:table-cell">Standzeit</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
        <TableBody>
          {vehicles.map((vehicle: VehicleWithImages) => {
            const daysOnLot = calculateDaysOnLot(vehicle.created_at);
            const isLongStanding = daysOnLot > 45;
            const fuelLabel = vehicle.fuel_type
              ? fuelTypeLabels[vehicle.fuel_type as FuelType] ||
                vehicle.fuel_type
              : "";
            const isSelectable =
              vehicle.status === "in_stock" || vehicle.status === "reserved";
            const isSelected = selectedIds.has(vehicle.id);
            
            // Get main image or first image
            const mainImage = vehicle.vehicle_images?.find(img => img.is_main) 
              || vehicle.vehicle_images?.[0];

            return (
              <TableRow
                key={vehicle.id}
                className={isSelected ? "bg-blue-50" : undefined}
              >
                <TableCell>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleSelect(vehicle.id)}
                    disabled={!isSelectable}
                    aria-label={`${vehicle.make} ${vehicle.model} auswählen`}
                  />
                </TableCell>
                <TableCell>
                  {mainImage ? (
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 relative">
                      <Image
                        src={mainImage.url}
                        alt={`${vehicle.make} ${vehicle.model}`}
                        fill
                        sizes="48px"
                        className="object-cover"
                        priority={false}
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                      <ImageIcon className="w-5 h-5 text-slate-400" />
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="font-medium">
                    {vehicle.make} {vehicle.model}
                  </div>
                  <div className="text-sm text-slate-500">
                    {getYear(vehicle.first_registration)} •{" "}
                    {vehicle.mileage?.toLocaleString("de-CH")} km • {fuelLabel}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-semibold">
                    {vehicle.asking_price
                      ? formatPrice(vehicle.asking_price)
                      : "-"}
                  </div>
                  {vehicle.purchase_price && (
                    <div className="text-xs text-slate-500">
                      EK: {formatPrice(vehicle.purchase_price)}
                    </div>
                  )}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge className={statusColors[vehicle.status]}>
                    {statusLabels[vehicle.status]}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <span
                    className={`font-medium ${
                      isLongStanding ? "text-orange-600" : ""
                    }`}
                  >
                    {daysOnLot} Tage
                  </span>
                  {isLongStanding && (
                    <span className="ml-1 text-orange-500">⚠️</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/dashboard/vehicles/${vehicle.id}`}>
                    <Button variant="outline" size="sm">
                      Bearbeiten
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
        </Table>
      </div>
    </div>
  );
}
