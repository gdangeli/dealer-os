import { notFound } from "next/navigation";

// Catch-all route that triggers the not-found page
export default function CatchAllPage() {
  notFound();
}
