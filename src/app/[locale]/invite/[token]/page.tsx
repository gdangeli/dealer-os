import { createClient } from '@/lib/supabase/server';
import { InviteAcceptClient } from './invite-accept-client';

interface PageProps {
  params: Promise<{ token: string; locale: string }>;
}

export default async function InviteAcceptPage({ params }: PageProps) {
  const { token, locale } = await params;
  const supabase = await createClient();
  
  // Check if user is logged in
  const { data: { user } } = await supabase.auth.getUser();
  
  // Fetch invitation details
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/team/accept?token=${token}`,
    { cache: 'no-store' }
  );
  
  if (!res.ok) {
    // Invalid or expired invitation
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg text-center">
          <div className="text-6xl mb-4">😔</div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Einladung ungültig
          </h1>
          <p className="text-slate-600 mb-6">
            Diese Einladung ist abgelaufen oder existiert nicht mehr.
          </p>
          <a 
            href={`/${locale}/login`}
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Zur Anmeldung
          </a>
        </div>
      </div>
    );
  }
  
  const { invitation } = await res.json();
  
  return (
    <InviteAcceptClient 
      token={token}
      invitation={invitation}
      isLoggedIn={!!user}
      userEmail={user?.email}
      locale={locale}
    />
  );
}
