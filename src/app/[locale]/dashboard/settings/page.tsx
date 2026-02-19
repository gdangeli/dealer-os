import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SettingsClient } from "./settings-client";
import { getCurrentDealer } from "@/lib/auth/get-current-dealer";

export const metadata = {
  title: "Einstellungen",
};

export default async function SettingsPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Get dealer profile via team_members
  const dealer = await getCurrentDealer();

  if (!dealer) {
    redirect('/dashboard');
  }

  return (
    <SettingsClient 
      initialDealer={dealer} 
      userEmail={user.email || ''} 
    />
  );
}
