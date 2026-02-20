"use client";

import { useEffect } from "react";
import Image from "next/image";

interface Vehicle {
  id: string;
  make: string;
  model: string;
  variant?: string;
  year: number | null;
  mileage: number | null;
  fuelType: string | null;
  transmission: string | null;
  price: number | null;
  image: string | null;
}

interface EmbedConfig {
  primaryColor: string;
  fontFamily: string;
  buttonStyle: string;
  darkMode: boolean;
  layout: string;
  showPrice: boolean;
  contactUrl: string | null;
}

interface EmbedClientProps {
  dealer: { id: string; name: string };
  vehicles: Vehicle[];
  config: EmbedConfig;
}

const fuelTypeLabels: Record<string, string> = {
  petrol: "Benzin",
  diesel: "Diesel",
  electric: "Elektro",
  hybrid: "Hybrid",
  plug_in_hybrid: "Plug-in-Hybrid",
  gas: "Gas",
};

const transmissionLabels: Record<string, string> = {
  manual: "Schaltgetriebe",
  automatic: "Automatik",
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat("de-CH", {
    style: "currency",
    currency: "CHF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

function formatMileage(km: number): string {
  return new Intl.NumberFormat("de-CH").format(km) + " km";
}

export function EmbedClient({ dealer, vehicles, config }: EmbedClientProps) {
  // Send height to parent for responsive iframe
  useEffect(() => {
    const sendHeight = () => {
      const height = document.body.scrollHeight;
      window.parent.postMessage({ type: "dealeros-height", height }, "*");
    };
    
    sendHeight();
    window.addEventListener("resize", sendHeight);
    
    // Send height after images load
    const images = document.querySelectorAll("img");
    images.forEach((img) => {
      img.addEventListener("load", sendHeight);
    });

    return () => {
      window.removeEventListener("resize", sendHeight);
    };
  }, [vehicles]);

  const buttonClass = config.buttonStyle === "square" 
    ? "rounded-none" 
    : config.buttonStyle === "pill" 
      ? "rounded-full" 
      : "rounded-lg";

  const bgColor = config.darkMode ? "bg-gray-900" : "bg-white";
  const textColor = config.darkMode ? "text-white" : "text-gray-900";
  const textMuted = config.darkMode ? "text-gray-400" : "text-gray-500";
  const cardBg = config.darkMode ? "bg-gray-800" : "bg-gray-50";
  const borderColor = config.darkMode ? "border-gray-700" : "border-gray-200";

  if (vehicles.length === 0) {
    return (
      <div 
        className={`min-h-[200px] flex items-center justify-center ${bgColor} ${textMuted}`}
        style={{ fontFamily: config.fontFamily }}
      >
        <p>Keine Fahrzeuge verfügbar</p>
      </div>
    );
  }

  return (
    <div 
      className={`p-4 ${bgColor}`}
      style={{ fontFamily: config.fontFamily }}
    >
      {/* Grid Layout */}
      {config.layout === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map((vehicle) => (
            <VehicleCard 
              key={vehicle.id} 
              vehicle={vehicle} 
              config={config}
              buttonClass={buttonClass}
              textColor={textColor}
              textMuted={textMuted}
              cardBg={cardBg}
              borderColor={borderColor}
            />
          ))}
        </div>
      )}

      {/* List Layout */}
      {config.layout === "list" && (
        <div className="space-y-3">
          {vehicles.map((vehicle) => (
            <VehicleListItem
              key={vehicle.id}
              vehicle={vehicle}
              config={config}
              buttonClass={buttonClass}
              textColor={textColor}
              textMuted={textMuted}
              cardBg={cardBg}
              borderColor={borderColor}
            />
          ))}
        </div>
      )}

      {/* Slider Layout */}
      {config.layout === "slider" && (
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="flex-shrink-0 w-72 snap-start">
              <VehicleCard
                vehicle={vehicle}
                config={config}
                buttonClass={buttonClass}
                textColor={textColor}
                textMuted={textMuted}
                cardBg={cardBg}
                borderColor={borderColor}
              />
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className={`mt-4 pt-4 border-t ${borderColor} text-center`}>
        <a 
          href={`https://dealeros.ch`}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-xs ${textMuted} hover:underline`}
        >
          Powered by Dealer OS
        </a>
      </div>
    </div>
  );
}

function VehicleCard({
  vehicle,
  config,
  buttonClass,
  textColor,
  textMuted,
  cardBg,
  borderColor,
}: {
  vehicle: Vehicle;
  config: EmbedConfig;
  buttonClass: string;
  textColor: string;
  textMuted: string;
  cardBg: string;
  borderColor: string;
}) {
  const handleContact = () => {
    if (config.contactUrl) {
      window.open(`${config.contactUrl}?vehicle=${vehicle.id}`, "_blank");
    } else {
      window.parent.postMessage({ 
        type: "dealeros-contact", 
        vehicleId: vehicle.id,
        vehicle: `${vehicle.make} ${vehicle.model}`,
      }, "*");
    }
  };

  return (
    <div className={`${cardBg} border ${borderColor} rounded-lg overflow-hidden`}>
      {/* Image */}
      <div className="aspect-[4/3] relative bg-gray-200">
        {vehicle.image ? (
          <Image
            src={vehicle.image}
            alt={`${vehicle.make} ${vehicle.model}`}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className={`font-semibold ${textColor} truncate`}>
          {vehicle.make} {vehicle.model}
        </h3>
        {vehicle.variant && (
          <p className={`text-sm ${textMuted} truncate`}>{vehicle.variant}</p>
        )}
        
        <div className={`mt-2 text-sm ${textMuted} space-y-1`}>
          <div className="flex justify-between">
            <span>{vehicle.year || "-"}</span>
            <span>{vehicle.mileage ? formatMileage(vehicle.mileage) : "-"}</span>
          </div>
          <div className="flex justify-between">
            <span>{vehicle.fuelType ? fuelTypeLabels[vehicle.fuelType] || vehicle.fuelType : "-"}</span>
            <span>{vehicle.transmission ? transmissionLabels[vehicle.transmission] || vehicle.transmission : "-"}</span>
          </div>
        </div>

        {config.showPrice && vehicle.price && (
          <p className={`mt-3 text-lg font-bold ${textColor}`}>
            {formatPrice(vehicle.price)}
          </p>
        )}

        <button
          onClick={handleContact}
          className={`mt-3 w-full py-2 px-4 text-white text-sm font-medium ${buttonClass} transition-colors`}
          style={{ backgroundColor: config.primaryColor }}
        >
          Anfragen
        </button>
      </div>
    </div>
  );
}

function VehicleListItem({
  vehicle,
  config,
  buttonClass,
  textColor,
  textMuted,
  cardBg,
  borderColor,
}: {
  vehicle: Vehicle;
  config: EmbedConfig;
  buttonClass: string;
  textColor: string;
  textMuted: string;
  cardBg: string;
  borderColor: string;
}) {
  const handleContact = () => {
    if (config.contactUrl) {
      window.open(`${config.contactUrl}?vehicle=${vehicle.id}`, "_blank");
    } else {
      window.parent.postMessage({ 
        type: "dealeros-contact", 
        vehicleId: vehicle.id,
        vehicle: `${vehicle.make} ${vehicle.model}`,
      }, "*");
    }
  };

  return (
    <div className={`${cardBg} border ${borderColor} rounded-lg p-3 flex gap-4`}>
      {/* Image */}
      <div className="w-32 h-24 relative flex-shrink-0 rounded overflow-hidden bg-gray-200">
        {vehicle.image ? (
          <Image
            src={vehicle.image}
            alt={`${vehicle.make} ${vehicle.model}`}
            fill
            className="object-cover"
            sizes="128px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className={`font-semibold ${textColor} truncate`}>
          {vehicle.make} {vehicle.model}
        </h3>
        <p className={`text-sm ${textMuted}`}>
          {vehicle.year || "-"} • {vehicle.mileage ? formatMileage(vehicle.mileage) : "-"} • {vehicle.fuelType ? fuelTypeLabels[vehicle.fuelType] || vehicle.fuelType : "-"}
        </p>
        {config.showPrice && vehicle.price && (
          <p className={`mt-1 font-bold ${textColor}`}>
            {formatPrice(vehicle.price)}
          </p>
        )}
      </div>

      {/* Button */}
      <div className="flex-shrink-0 self-center">
        <button
          onClick={handleContact}
          className={`py-2 px-4 text-white text-sm font-medium ${buttonClass} transition-colors`}
          style={{ backgroundColor: config.primaryColor }}
        >
          Anfragen
        </button>
      </div>
    </div>
  );
}
