/**
 * Bexio OAuth Callback Route
 * 
 * Handles the OAuth 2.0 callback from Bexio, exchanges the code for tokens,
 * and stores them securely in the database.
 * 
 * GET /api/bexio/callback?code=xxx&state=xxx
 */

import { createClient } from '@/lib/supabase/server';
import { exchangeCodeForTokens, decodeState, getBexioConfig } from '@/lib/bexio/oauth';
import { encryptToken } from '@/lib/bexio/crypto';
import { BexioClient } from '@/lib/bexio/client';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');
  const errorDescription = url.searchParams.get('error_description');

  // Get base URL for redirects
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.dealeros.ch';

  // Handle OAuth errors from Bexio
  if (error) {
    console.error('[Bexio Callback] OAuth error:', error, errorDescription);
    const redirectUrl = new URL('/dashboard/settings/bexio', baseUrl);
    redirectUrl.searchParams.set('error', 'oauth_error');
    redirectUrl.searchParams.set('message', errorDescription || 'Bexio-Autorisierung fehlgeschlagen');
    return NextResponse.redirect(redirectUrl);
  }

  // Validate required parameters
  if (!code || !state) {
    const redirectUrl = new URL('/dashboard/settings/bexio', baseUrl);
    redirectUrl.searchParams.set('error', 'invalid_request');
    redirectUrl.searchParams.set('message', 'Ungültige Anfrage');
    return NextResponse.redirect(redirectUrl);
  }

  try {
    // Decode and validate state
    const { dealerId, returnUrl } = decodeState(state);

    const supabase = await createClient();

    // Verify dealer exists and user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      const redirectUrl = new URL('/login', baseUrl);
      redirectUrl.searchParams.set('returnUrl', returnUrl || '/dashboard/settings/bexio');
      return NextResponse.redirect(redirectUrl);
    }

    // Verify dealer belongs to user
    const { data: dealer, error: dealerError } = await supabase
      .from('dealers')
      .select('id')
      .eq('id', dealerId)
      .eq('user_id', user.id)
      .single();

    if (dealerError || !dealer) {
      console.error('[Bexio Callback] Dealer validation failed:', dealerError);
      const redirectUrl = new URL('/dashboard/settings/bexio', baseUrl);
      redirectUrl.searchParams.set('error', 'invalid_state');
      redirectUrl.searchParams.set('message', 'Ungültige Sitzung');
      return NextResponse.redirect(redirectUrl);
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code);

    // Calculate token expiration
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

    // Encrypt tokens for secure storage
    const encryptedAccessToken = encryptToken(tokens.access_token);
    const encryptedRefreshToken = encryptToken(tokens.refresh_token);

    // Get company info from Bexio
    let companyId: number | null = null;
    let companyName: string | null = null;

    try {
      // Create a temporary client to fetch company info
      const tempClient = new BexioClient({
        dealerId: dealer.id,
        encryptedAccessToken,
        encryptedRefreshToken,
        tokenExpiresAt: expiresAt,
      });

      const companyProfile = await tempClient.getCompanyProfile();
      companyId = companyProfile.id;
      companyName = companyProfile.name;
    } catch (companyError) {
      console.warn('[Bexio Callback] Could not fetch company profile:', companyError);
      // Continue without company info - connection still works
    }

    // Store tokens in database
    const { error: updateError } = await supabase
      .from('dealers')
      .update({
        bexio_access_token: encryptedAccessToken,
        bexio_refresh_token: encryptedRefreshToken,
        bexio_token_expires_at: expiresAt.toISOString(),
        bexio_company_id: companyId,
        bexio_company_name: companyName,
        bexio_connected_at: new Date().toISOString(),
        bexio_is_connected: true,
        bexio_last_error: null,
      })
      .eq('id', dealer.id);

    if (updateError) {
      console.error('[Bexio Callback] Database update failed:', updateError);
      const redirectUrl = new URL('/dashboard/settings/bexio', baseUrl);
      redirectUrl.searchParams.set('error', 'storage_error');
      redirectUrl.searchParams.set('message', 'Tokens konnten nicht gespeichert werden');
      return NextResponse.redirect(redirectUrl);
    }

    // Success! Redirect to return URL
    const redirectUrl = new URL(returnUrl || '/dashboard/settings/bexio', baseUrl);
    redirectUrl.searchParams.set('success', 'connected');
    if (companyName) {
      redirectUrl.searchParams.set('company', companyName);
    }
    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error('[Bexio Callback] Error:', error);
    const redirectUrl = new URL('/dashboard/settings/bexio', baseUrl);
    redirectUrl.searchParams.set('error', 'exchange_error');
    redirectUrl.searchParams.set('message', error instanceof Error ? error.message : 'Unbekannter Fehler');
    return NextResponse.redirect(redirectUrl);
  }
}
