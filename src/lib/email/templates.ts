// German email templates for DealerOS

const STYLES = `
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; }
    .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none; }
    .button { display: inline-block; background: #3b82f6; color: white !important; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }
    .stat-box { background: #f1f5f9; padding: 15px; border-radius: 8px; margin: 10px 0; }
    .stat-number { font-size: 28px; font-weight: bold; color: #3b82f6; }
    .warning-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 15px 0; }
    .vehicle-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin: 10px 0; }
    .lead-info { background: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; margin: 15px 0; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #e2e8f0; }
    th { background: #f8fafc; font-weight: 600; }
  </style>
`;

const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${STYLES}
</head>
<body>
  <div class="container">
    ${content}
    <div class="footer">
      <p>DealerOS - Ihr digitaler Fahrzeug-Assistent</p>
      <p>Diese E-Mail wurde automatisch versendet. <a href="{{settingsUrl}}">Benachrichtigungseinstellungen ändern</a></p>
    </div>
  </div>
</body>
</html>
`;

// ============================================================================
// New Lead Notification
// ============================================================================
export interface NewLeadEmailData {
  dealerName: string;
  leadName: string;
  leadEmail?: string;
  leadPhone?: string;
  leadMessage?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleId?: string;
  source?: string;
  dashboardUrl: string;
  settingsUrl: string;
}

export function newLeadEmail(data: NewLeadEmailData): string {
  const vehicleInfo = data.vehicleMake && data.vehicleModel 
    ? `<p><strong>Fahrzeug:</strong> ${data.vehicleMake} ${data.vehicleModel}</p>` 
    : '';
  
  const sourceLabel = {
    autoscout24: 'AutoScout24',
    tutti: 'tutti.ch',
    website: 'Webseite',
    phone: 'Telefon',
    walkin: 'Walk-in',
    other: 'Andere',
  }[data.source || 'other'] || data.source;

  return baseTemplate(`
    <div class="header">
      <h1>🎉 Neue Anfrage eingegangen!</h1>
    </div>
    <div class="content">
      <p>Hallo ${data.dealerName},</p>
      
      <p>Sie haben eine neue Kundenanfrage erhalten:</p>
      
      <div class="lead-info">
        <p><strong>👤 Name:</strong> ${data.leadName}</p>
        ${data.leadEmail ? `<p><strong>📧 E-Mail:</strong> <a href="mailto:${data.leadEmail}">${data.leadEmail}</a></p>` : ''}
        ${data.leadPhone ? `<p><strong>📞 Telefon:</strong> <a href="tel:${data.leadPhone}">${data.leadPhone}</a></p>` : ''}
        ${vehicleInfo}
        <p><strong>📍 Quelle:</strong> ${sourceLabel}</p>
      </div>
      
      ${data.leadMessage ? `
        <p><strong>Nachricht:</strong></p>
        <blockquote style="background: #f8fafc; padding: 15px; border-left: 4px solid #3b82f6; margin: 15px 0;">
          ${data.leadMessage}
        </blockquote>
      ` : ''}
      
      <p style="text-align: center;">
        <a href="${data.dashboardUrl}" class="button">Anfrage bearbeiten →</a>
      </p>
      
      <p style="color: #64748b; font-size: 14px;">
        💡 <strong>Tipp:</strong> Schnelle Reaktionszeiten erhöhen Ihre Abschlussquote deutlich!
      </p>
    </div>
  `.replace('{{settingsUrl}}', data.settingsUrl));
}

// ============================================================================
// Daily Summary
// ============================================================================
export interface DailySummaryEmailData {
  dealerName: string;
  date: string;
  newLeadsCount: number;
  newLeads: Array<{ name: string; vehicle?: string; source?: string }>;
  openLeadsCount: number;
  vehiclesInStock: number;
  longstandingVehicles: Array<{ make: string; model: string; days: number; id: string }>;
  recentSales: number;
  dashboardUrl: string;
  settingsUrl: string;
}

export function dailySummaryEmail(data: DailySummaryEmailData): string {
  const leadsTable = data.newLeads.length > 0 
    ? `
      <table>
        <tr><th>Name</th><th>Fahrzeug</th><th>Quelle</th></tr>
        ${data.newLeads.map(l => `
          <tr>
            <td>${l.name}</td>
            <td>${l.vehicle || '-'}</td>
            <td>${l.source || '-'}</td>
          </tr>
        `).join('')}
      </table>
    `
    : '<p style="color: #64748b;">Keine neuen Anfragen gestern.</p>';

  const longstandingSection = data.longstandingVehicles.length > 0
    ? `
      <div class="warning-box">
        <p><strong>⚠️ Langsteher-Warnung</strong></p>
        <p>Diese Fahrzeuge stehen schon lange im Bestand:</p>
        <ul>
          ${data.longstandingVehicles.map(v => `
            <li><strong>${v.make} ${v.model}</strong> - ${v.days} Tage</li>
          `).join('')}
        </ul>
        <p style="font-size: 14px;">Erwägen Sie Preisanpassungen oder verstärkte Werbung.</p>
      </div>
    `
    : '';

  return baseTemplate(`
    <div class="header">
      <h1>📊 Tägliche Zusammenfassung</h1>
    </div>
    <div class="content">
      <p>Guten Morgen ${data.dealerName},</p>
      
      <p>hier ist Ihre Übersicht für <strong>${data.date}</strong>:</p>
      
      <div style="display: flex; gap: 15px; flex-wrap: wrap; margin: 20px 0;">
        <div class="stat-box" style="flex: 1; min-width: 120px; text-align: center;">
          <div class="stat-number">${data.newLeadsCount}</div>
          <div>Neue Anfragen</div>
        </div>
        <div class="stat-box" style="flex: 1; min-width: 120px; text-align: center;">
          <div class="stat-number">${data.openLeadsCount}</div>
          <div>Offene Anfragen</div>
        </div>
        <div class="stat-box" style="flex: 1; min-width: 120px; text-align: center;">
          <div class="stat-number">${data.vehiclesInStock}</div>
          <div>Fahrzeuge im Bestand</div>
        </div>
      </div>
      
      <h3>📥 Neue Anfragen gestern</h3>
      ${leadsTable}
      
      ${longstandingSection}
      
      <p style="text-align: center;">
        <a href="${data.dashboardUrl}" class="button">Zum Dashboard →</a>
      </p>
      
      <p style="color: #64748b; font-size: 14px; text-align: center;">
        Haben Sie einen erfolgreichen Tag! 🚗
      </p>
    </div>
  `.replace('{{settingsUrl}}', data.settingsUrl));
}

// ============================================================================
// Longstanding Vehicle Warning
// ============================================================================
export interface LongstandingWarningEmailData {
  dealerName: string;
  vehicles: Array<{
    id: string;
    make: string;
    model: string;
    daysInStock: number;
    askingPrice?: number;
    purchasePrice?: number;
  }>;
  thresholdDays: number;
  dashboardUrl: string;
  settingsUrl: string;
}

export function longstandingWarningEmail(data: LongstandingWarningEmailData): string {
  const vehiclesList = data.vehicles.map(v => {
    const margin = v.askingPrice && v.purchasePrice 
      ? `(Marge: CHF ${(v.askingPrice - v.purchasePrice).toLocaleString('de-CH')})`
      : '';
    
    return `
      <div class="vehicle-card">
        <h4 style="margin: 0 0 10px 0;">${v.make} ${v.model}</h4>
        <p style="margin: 0; color: #dc2626;"><strong>📅 ${v.daysInStock} Tage</strong> im Bestand</p>
        ${v.askingPrice ? `<p style="margin: 5px 0;">💰 Preis: CHF ${v.askingPrice.toLocaleString('de-CH')} ${margin}</p>` : ''}
      </div>
    `;
  }).join('');

  return baseTemplate(`
    <div class="header" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
      <h1>⚠️ Langsteher-Warnung</h1>
    </div>
    <div class="content">
      <p>Hallo ${data.dealerName},</p>
      
      <p>Die folgenden <strong>${data.vehicles.length} Fahrzeuge</strong> stehen länger als <strong>${data.thresholdDays} Tage</strong> in Ihrem Bestand:</p>
      
      ${vehiclesList}
      
      <div style="background: #f0f9ff; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h4 style="margin: 0 0 10px 0;">💡 Empfehlungen bei Langstehern:</h4>
        <ul style="margin: 0; padding-left: 20px;">
          <li>Preis um 3-5% reduzieren</li>
          <li>Neue, bessere Fotos aufnehmen</li>
          <li>Beschreibung überarbeiten und Keywords optimieren</li>
          <li>Auf zusätzlichen Plattformen inserieren</li>
          <li>Gezielte Social-Media-Werbung schalten</li>
        </ul>
      </div>
      
      <p style="text-align: center;">
        <a href="${data.dashboardUrl}" class="button">Fahrzeuge bearbeiten →</a>
      </p>
    </div>
  `.replace('{{settingsUrl}}', data.settingsUrl));
}
