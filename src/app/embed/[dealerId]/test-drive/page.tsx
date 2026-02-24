import { TestDriveWidget } from "./test-drive-widget";

interface PageProps {
  params: Promise<{ dealerId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function getDealerAndVehicles(dealerId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.dealeros.ch";
  
  try {
    const response = await fetch(`${baseUrl}/api/public/test-drives?dealer_id=${dealerId}`, {
      cache: "no-store",
    });
    
    if (!response.ok) {
      return null;
    }
    
    return response.json();
  } catch (error) {
    console.error("Error fetching dealer data:", error);
    return null;
  }
}

export default async function TestDriveEmbedPage({ params, searchParams }: PageProps) {
  const { dealerId } = await params;
  const search = await searchParams;
  
  const data = await getDealerAndVehicles(dealerId);
  
  if (!data) {
    return (
      <div className="min-h-[300px] flex items-center justify-center text-gray-500">
        <p>Händler nicht gefunden</p>
      </div>
    );
  }

  // Config from query params
  const config = {
    primaryColor: (search.color as string) || "#2563eb",
    darkMode: search.dark === "true",
    preselectedVehicle: search.vehicle as string | undefined,
    locale: (search.locale as string) || "de",
  };

  return (
    <TestDriveWidget
      dealerId={dealerId}
      dealerName={data.dealer.name}
      vehicles={data.vehicles}
      config={config}
    />
  );
}
