/**
 * Bexio OAuth Connect Route
 * 
 * Initiates the OAuth 2.0 authorization flow by redirecting to Bexio.
 * 
 * GET /api/bexio/connect
 */

import { createClient } from '@/lib/supabase/server';
import { generateAuthUrl, encodeState } from '@/lib/bexio/oauth';
import { NextResponse } from 'next/server';
import { getCurrentDealer } from '@/lib/auth/get-current-dealer';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 401 }
      );
    }

    // Get dealer via team_members
    const dealer = await getCurrentDealer();

    if (!dealer) {
      return NextResponse.json(
        { error: 'Händler nicht gefunden' },
        { status: 404 }
      );
    }

    // Get return URL from query params
    const url = new URL(request.url);
    const returnUrl = url.searchParams.get('returnUrl') || '/dashboard/settings/bexio';

    // Generate state with dealer ID for CSRF protection
    const state = encodeState(dealer.id, returnUrl);

    // Generate authorization URL
    const authUrl = generateAuthUrl(state);

    // Redirect to Bexio
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('[Bexio Connect] Error:', error);
    
    // Check if it's a configuration error
    if (error instanceof Error && error.message.includes('not configured')) {
      return NextResponse.json(
        { error: 'Bexio-Integration ist nicht konfiguriert. Bitte kontaktieren Sie den Support.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Verbindung konnte nicht hergestellt werden' },
      { status: 500 }
    );
  }
}
