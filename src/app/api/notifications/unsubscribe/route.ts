import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

let _supabase: SupabaseClient | null = null;
function getSupabase(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _supabase;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://dealer-os.ch';

// Mapping of notification types to database columns
const NOTIFICATION_COLUMNS: Record<string, string> = {
  'new_lead': 'notification_new_lead',
  'daily_summary': 'notification_daily_summary',
  'quote_expiry': 'notification_quote_expiry',
  'invoice_overdue': 'notification_invoice_overdue',
  'all': 'all', // Special case: disable all notifications
};

const NOTIFICATION_LABELS: Record<string, string> = {
  'new_lead': 'Neue Anfragen',
  'daily_summary': 'Tägliche Zusammenfassung',
  'quote_expiry': 'Offerten-Erinnerungen',
  'invoice_overdue': 'Rechnungs-Mahnungen',
  'all': 'Alle Benachrichtigungen',
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const type = searchParams.get('type') || 'all';
    const confirm = searchParams.get('confirm') === 'true';

    if (!token) {
      return new NextResponse(generateHtml('Fehler', 'Ungültiger Abmelde-Link.', 'error'), {
        status: 400,
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // Validate notification type
    if (!NOTIFICATION_COLUMNS[type]) {
      return new NextResponse(generateHtml('Fehler', 'Ungültiger Benachrichtigungstyp.', 'error'), {
        status: 400,
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // Find dealer by unsubscribe token
    const { data: dealer, error: dealerError } = await getSupabase()
      .from('dealers')
      .select('id, company_name, email')
      .eq('notification_unsubscribe_token', token)
      .single();

    if (dealerError || !dealer) {
      return new NextResponse(generateHtml('Fehler', 'Ungültiger oder abgelaufener Abmelde-Link.', 'error'), {
        status: 404,
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // If not confirmed, show confirmation page
    if (!confirm) {
      const label = NOTIFICATION_LABELS[type];
      const confirmUrl = `${APP_URL}/api/notifications/unsubscribe?token=${token}&type=${type}&confirm=true`;
      
      return new NextResponse(
        generateConfirmationPage(dealer.company_name, label, confirmUrl),
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    // Perform the unsubscription
    let updateData: Record<string, boolean>;
    
    if (type === 'all') {
      updateData = {
        notification_new_lead: false,
        notification_daily_summary: false,
        notification_quote_expiry: false,
        notification_invoice_overdue: false,
      };
    } else {
      updateData = {
        [NOTIFICATION_COLUMNS[type]]: false,
      };
    }

    const { error: updateError } = await getSupabase()
      .from('dealers')
      .update(updateData)
      .eq('id', dealer.id);

    if (updateError) {
      console.error('Error updating preferences:', updateError);
      return new NextResponse(
        generateHtml('Fehler', 'Beim Speichern ist ein Fehler aufgetreten.', 'error'),
        { status: 500, headers: { 'Content-Type': 'text/html' } }
      );
    }

    const label = NOTIFICATION_LABELS[type];
    const settingsUrl = `${APP_URL}/dashboard/settings`;

    return new NextResponse(
      generateSuccessPage(dealer.company_name, label, settingsUrl),
      { headers: { 'Content-Type': 'text/html' } }
    );

  } catch (error) {
    console.error('Unsubscribe error:', error);
    return new NextResponse(
      generateHtml('Fehler', 'Ein unerwarteter Fehler ist aufgetreten.', 'error'),
      { status: 500, headers: { 'Content-Type': 'text/html' } }
    );
  }
}

function generateHtml(title: string, message: string, type: 'success' | 'error'): string {
  const color = type === 'success' ? '#22c55e' : '#dc2626';
  const icon = type === 'success' ? '✅' : '❌';
  
  return `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - DealerOS</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; margin: 0; padding: 40px 20px; }
    .container { max-width: 480px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); padding: 40px; text-align: center; }
    h1 { color: ${color}; font-size: 24px; margin: 0 0 20px 0; }
    .icon { font-size: 48px; margin-bottom: 20px; }
    p { color: #64748b; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">${icon}</div>
    <h1>${title}</h1>
    <p>${message}</p>
  </div>
</body>
</html>
  `;
}

function generateConfirmationPage(companyName: string, notificationType: string, confirmUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Abmeldung bestätigen - DealerOS</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; margin: 0; padding: 40px 20px; }
    .container { max-width: 480px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); padding: 40px; text-align: center; }
    h1 { color: #1e293b; font-size: 24px; margin: 0 0 10px 0; }
    .company { color: #3b82f6; font-weight: 600; }
    p { color: #64748b; line-height: 1.6; }
    .notification-type { background: #f1f5f9; padding: 12px 20px; border-radius: 8px; display: inline-block; margin: 20px 0; font-weight: 600; color: #1e293b; }
    .button { display: inline-block; background: #dc2626; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 10px 0; }
    .button.secondary { background: #e2e8f0; color: #475569; }
    .warning { background: #fef3c7; border-radius: 8px; padding: 15px; margin: 20px 0; color: #92400e; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔔 Abmeldung bestätigen</h1>
    <p>Konto: <span class="company">${companyName}</span></p>
    
    <div class="notification-type">${notificationType}</div>
    
    <div class="warning">
      ⚠️ Nach der Abmeldung erhalten Sie keine E-Mails mehr für diesen Benachrichtigungstyp.
    </div>
    
    <p>Möchten Sie diese Benachrichtigungen wirklich deaktivieren?</p>
    
    <div>
      <a href="${confirmUrl}" class="button">Ja, abmelden</a>
      <a href="javascript:window.close()" class="button secondary">Abbrechen</a>
    </div>
  </div>
</body>
</html>
  `;
}

function generateSuccessPage(companyName: string, notificationType: string, settingsUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Erfolgreich abgemeldet - DealerOS</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; margin: 0; padding: 40px 20px; }
    .container { max-width: 480px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); padding: 40px; text-align: center; }
    h1 { color: #22c55e; font-size: 24px; margin: 0 0 20px 0; }
    .icon { font-size: 48px; margin-bottom: 20px; }
    .company { color: #3b82f6; font-weight: 600; }
    p { color: #64748b; line-height: 1.6; }
    .notification-type { background: #f1f5f9; padding: 8px 16px; border-radius: 6px; display: inline-block; margin: 10px 0; }
    .button { display: inline-block; background: #3b82f6; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 20px; }
    .info { background: #f0fdf4; border-radius: 8px; padding: 15px; margin: 20px 0; color: #166534; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">✅</div>
    <h1>Erfolgreich abgemeldet</h1>
    
    <p>
      <span class="company">${companyName}</span> erhält keine E-Mails mehr für:
    </p>
    
    <div class="notification-type">${notificationType}</div>
    
    <div class="info">
      💡 Sie können Ihre Benachrichtigungseinstellungen jederzeit in den Kontoeinstellungen wieder aktivieren.
    </div>
    
    <a href="${settingsUrl}" class="button">Zu den Einstellungen →</a>
  </div>
</body>
</html>
  `;
}
