'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Location } from '@/types/locations';

interface LocationFilterProps {
  locations: Location[];
  className?: string;
}

const LOCATION_COOKIE_KEY = 'dealeros_selected_location';

export function LocationFilter({ locations, className }: LocationFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Get initial value from URL or cookie
  const urlLocationId = searchParams.get('location');
  const [selectedLocation, setSelectedLocation] = useState<string>(urlLocationId || 'all');

  // On mount, check cookie if no URL param
  useEffect(() => {
    if (!urlLocationId) {
      const cookieValue = getCookie(LOCATION_COOKIE_KEY);
      if (cookieValue && (cookieValue === 'all' || locations.some(l => l.id === cookieValue))) {
        setSelectedLocation(cookieValue);
      }
    }
  }, [urlLocationId, locations]);

  const handleChange = (value: string) => {
    setSelectedLocation(value);
    
    // Save to cookie
    setCookie(LOCATION_COOKIE_KEY, value, 365);
    
    // Update URL
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'all') {
      params.delete('location');
    } else {
      params.set('location', value);
    }
    
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.push(newUrl);
  };

  // Don't render if no locations configured
  if (locations.length === 0) {
    return null;
  }

  const selectedLocationObj = locations.find(l => l.id === selectedLocation);
  const displayName = selectedLocation === 'all' 
    ? 'Alle Standorte'
    : selectedLocationObj?.name || 'Alle Standorte';

  return (
    <div className={className}>
      <Select value={selectedLocation} onValueChange={handleChange}>
        <SelectTrigger className="w-[200px] bg-white">
          <div className="flex items-center gap-2">
            <span className="text-sm">📍</span>
            <SelectValue>{displayName}</SelectValue>
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            <div className="flex items-center gap-2">
              <span>🏢</span>
              <span>Alle Standorte</span>
            </div>
          </SelectItem>
          {locations.map((location) => (
            <SelectItem key={location.id} value={location.id}>
              <div className="flex items-center gap-2">
                {location.is_main && <span>⭐</span>}
                <span>{location.name}</span>
                {location.city && <span className="text-slate-400">({location.city})</span>}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// Helper: Get cookie value
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

// Helper: Set cookie
function setCookie(name: string, value: string, days: number) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}
