/**
 * Bexio Disconnect Route
 * 
 * Disconnects the Bexio integration by revoking tokens and clearing stored data.
 * 
 * POST /api/bexio/disconnect
 */

import { createClient } from '@/lib/supabase/server';
import { decryptToken } from '@/lib/bexio/crypto';
import { revokeToken } from '@/lib/bexio/oauth';
import { NextResponse } from 'next/server';
import { getCurrentDealer } from '@/lib/auth/get-current-dealer';

export async function POST() {
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

    // Get dealer with Bexio tokens via team_members
    const dealerWithRole = await getCurrentDealer();
    if (!dealerWithRole) {
      return NextResponse.json(
        { error: 'Händler nicht gefunden' },
        { status: 404 }
      );
    }
    
    // Get full dealer data with Bexio tokens
    const { data: dealer, error: dealerError } = await supabase
      .from('dealers')
      .select('id, bexio_access_token, bexio_refresh_token')
      .eq('id', dealerWithRole.id)
      .single();

    if (dealerError || !dealer) {
      return NextResponse.json(
        { error: 'Händler nicht gefunden' },
        { status: 404 }
      );
    }

    // Revoke tokens at Bexio (best effort - don't fail if this doesn't work)
    if (dealer.bexio_access_token) {
      try {
        const accessToken = decryptToken(dealer.bexio_access_token);
        await revokeToken(accessToken);
      } catch (revokeError) {
        console.warn('[Bexio Disconnect] Token revocation failed:', revokeError);
        // Continue anyway - we'll clear local tokens
      }
    }

    if (dealer.bexio_refresh_token) {
      try {
        const refreshToken = decryptToken(dealer.bexio_refresh_token);
        await revokeToken(refreshToken);
      } catch (revokeError) {
        console.warn('[Bexio Disconnect] Refresh token revocation failed:', revokeError);
      }
    }

    // Clear Bexio data from database
    const { error: updateError } = await supabase
      .from('dealers')
      .update({
        bexio_access_token: null,
        bexio_refresh_token: null,
        bexio_token_expires_at: null,
        bexio_company_id: null,
        bexio_company_name: null,
        bexio_connected_at: null,
        bexio_is_connected: false,
        bexio_last_sync_at: null,
        bexio_last_error: null,
      })
      .eq('id', dealer.id);

    if (updateError) {
      console.error('[Bexio Disconnect] Database update failed:', updateError);
      return NextResponse.json(
        { error: 'Verbindung konnte nicht getrennt werden' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Bexio-Verbindung erfolgreich getrennt',
    });

  } catch (error) {
    console.error('[Bexio Disconnect] Error:', error);
    return NextResponse.json(
      { error: 'Unbekannter Fehler beim Trennen der Verbindung' },
      { status: 500 }
    );
  }
}
