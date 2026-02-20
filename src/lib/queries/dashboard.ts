import { createClient } from "@/lib/supabase/server";
import { createCachedQuery, CACHE_TAGS } from "@/lib/cache";

export interface DashboardStats {
  totalVehicles: number;
  inStock: number;
  reserved: number;
  sold: number;
  totalLeads: number;
  newLeads: number;
  totalCustomers: number;
  pendingQuotes: number;
  overdueInvoices: number;
}

/**
 * Get dashboard stats - cached for 60 seconds
 */
export async function getDashboardStats(dealerId: string): Promise<DashboardStats> {
  const supabase = await createClient();

  // Parallel queries for better performance
  const [
    vehiclesResult,
    leadsResult,
    customersResult,
    quotesResult,
    invoicesResult,
  ] = await Promise.all([
    // Vehicles count by status
    supabase
      .from("vehicles")
      .select("status", { count: "exact", head: false })
      .eq("dealer_id", dealerId),
    
    // Leads - total and new (last 7 days)
    supabase
      .from("leads")
      .select("created_at", { count: "exact", head: false })
      .eq("dealer_id", dealerId),
    
    // Customers count
    supabase
      .from("customers")
      .select("id", { count: "exact", head: true })
      .eq("dealer_id", dealerId),
    
    // Pending quotes
    supabase
      .from("quotes")
      .select("id", { count: "exact", head: true })
      .eq("dealer_id", dealerId)
      .eq("status", "pending"),
    
    // Overdue invoices
    supabase
      .from("invoices")
      .select("id", { count: "exact", head: true })
      .eq("dealer_id", dealerId)
      .eq("status", "overdue"),
  ]);

  const vehicles = vehiclesResult.data || [];
  const leads = leadsResult.data || [];
  
  // Calculate vehicle stats
  const totalVehicles = vehicles.length;
  const inStock = vehicles.filter((v) => v.status === "in_stock").length;
  const reserved = vehicles.filter((v) => v.status === "reserved").length;
  const sold = vehicles.filter((v) => v.status === "sold").length;

  // Calculate lead stats
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const newLeads = leads.filter(
    (l) => new Date(l.created_at) > sevenDaysAgo
  ).length;

  return {
    totalVehicles,
    inStock,
    reserved,
    sold,
    totalLeads: leads.length,
    newLeads,
    totalCustomers: customersResult.count || 0,
    pendingQuotes: quotesResult.count || 0,
    overdueInvoices: invoicesResult.count || 0,
  };
}

/**
 * Get recent activity for dashboard
 */
export async function getRecentActivity(dealerId: string, limit = 10) {
  const supabase = await createClient();

  // Get recent leads
  const { data: recentLeads } = await supabase
    .from("leads")
    .select("id, name, email, created_at, status")
    .eq("dealer_id", dealerId)
    .order("created_at", { ascending: false })
    .limit(limit);

  // Get recent sales (vehicles with status 'sold')
  const { data: recentSales } = await supabase
    .from("vehicles")
    .select("id, brand, model, sold_at, price")
    .eq("dealer_id", dealerId)
    .eq("status", "sold")
    .order("sold_at", { ascending: false })
    .limit(limit);

  return {
    recentLeads: recentLeads || [],
    recentSales: recentSales || [],
  };
}
