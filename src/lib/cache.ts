import { unstable_cache } from "next/cache";

/**
 * Cache wrapper for database queries
 * Uses Next.js unstable_cache for server-side caching
 */
export function createCachedQuery<T, A extends unknown[]>(
  queryFn: (...args: A) => Promise<T>,
  keyParts: string[],
  options?: {
    revalidate?: number; // seconds
    tags?: string[];
  }
) {
  return unstable_cache(
    queryFn,
    keyParts,
    {
      revalidate: options?.revalidate ?? 60, // Default: 1 minute
      tags: options?.tags ?? keyParts,
    }
  );
}

/**
 * Cache tags for different data types
 * Use these for targeted cache invalidation
 */
export const CACHE_TAGS = {
  vehicles: (dealerId: string) => `vehicles-${dealerId}`,
  customers: (dealerId: string) => `customers-${dealerId}`,
  leads: (dealerId: string) => `leads-${dealerId}`,
  quotes: (dealerId: string) => `quotes-${dealerId}`,
  invoices: (dealerId: string) => `invoices-${dealerId}`,
  dealer: (dealerId: string) => `dealer-${dealerId}`,
  analytics: (dealerId: string) => `analytics-${dealerId}`,
} as const;

/**
 * Revalidate cache by tag
 * Call this after mutations using revalidatePath
 */
export async function invalidateCache(paths: string[]) {
  const { revalidatePath } = await import("next/cache");
  for (const path of paths) {
    revalidatePath(path);
  }
}
