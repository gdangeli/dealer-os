import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SettingsClient } from "./settings-client";

export const metadata = {
  title: "Einstellungen",
};

export default async function SettingsPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Get dealer profile
  const { data: dealer } = await supabase
    .from('dealers')
    .select('*')
    .eq('user_id', user.id)
    .single();

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
