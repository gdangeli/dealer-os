"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { VehicleStatus, statusLabels } from "@/types/vehicle";

interface VehicleStatusFilterProps {
  currentStatus?: VehicleStatus;
}

export function VehicleStatusFilter({
  currentStatus,
}: VehicleStatusFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleStatusChange = (status: VehicleStatus | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (status) {
      params.set("status", status);
    } else {
      params.delete("status");
    }

    router.push(`/dashboard/vehicles?${params.toString()}`);
  };

  return (
    <div className="flex gap-2">
      <Button
        variant={!currentStatus ? "default" : "outline"}
        size="sm"
        onClick={() => handleStatusChange(null)}
      >
        Alle
      </Button>
      <Button
        variant={currentStatus === "in_stock" ? "default" : "outline"}
        size="sm"
        onClick={() => handleStatusChange("in_stock")}
        className={currentStatus === "in_stock" ? "bg-green-600 hover:bg-green-700" : ""}
      >
        {statusLabels.in_stock}
      </Button>
      <Button
        variant={currentStatus === "reserved" ? "default" : "outline"}
        size="sm"
        onClick={() => handleStatusChange("reserved")}
        className={currentStatus === "reserved" ? "bg-yellow-600 hover:bg-yellow-700" : ""}
      >
        {statusLabels.reserved}
      </Button>
      <Button
        variant={currentStatus === "sold" ? "default" : "outline"}
        size="sm"
        onClick={() => handleStatusChange("sold")}
        className={currentStatus === "sold" ? "bg-slate-600 hover:bg-slate-700" : ""}
      >
        {statusLabels.sold}
      </Button>
    </div>
  );
}
