import { notFound } from "next/navigation";

// Dashboard catch-all route that triggers the not-found page
export default function DashboardCatchAllPage() {
  notFound();
}
