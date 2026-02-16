"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface VehiclePreviewProps {
  data: Array<Record<string, any>>;
  headers: string[];
  totalRows: number;
  onBack: () => void;
  onNext: () => void;
}

export function VehiclePreview({ data, headers, totalRows, onBack, onNext }: VehiclePreviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Datenvorschau</CardTitle>
        <CardDescription>
          Zeigt die ersten {data.length} von {totalRows} Zeilen aus Ihrer Datei
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 mb-4">
          <Badge variant="secondary">{totalRows} Zeilen gefunden</Badge>
          <Badge variant="secondary">{headers.length} Spalten</Badge>
        </div>

        <div className="border rounded-lg overflow-auto max-h-96">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                {headers.map((header, index) => (
                  <TableHead key={index} className="min-w-[120px]">
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  <TableCell className="font-medium">{rowIndex + 1}</TableCell>
                  {headers.map((header, colIndex) => (
                    <TableCell key={colIndex}>
                      <div className="max-w-[200px] truncate">
                        {row[header]?.toString() || "-"}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {totalRows > data.length && (
          <p className="text-sm text-gray-600 text-center">
            ... und {totalRows - data.length} weitere Zeilen
          </p>
        )}

        <div className="flex gap-4">
          <Button variant="outline" onClick={onBack}>
            Zurück
          </Button>
          <Button onClick={onNext} className="flex-1">
            Weiter zum Spalten-Mapping
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
