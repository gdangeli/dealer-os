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
  unsubscribeUrl?: string;
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
    <div class="footer">
      <p>DealerOS - Ihr digitaler Fahrzeug-Assistent</p>
      <p>
        <a href="${data.settingsUrl}">Benachrichtigungseinstellungen</a>${data.unsubscribeUrl ? ` · <a href="${data.unsubscribeUrl}">Abmelden</a>` : ''}
      </p>
    </div>
  `);
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
  unsubscribeUrl?: string;
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
    <div class="footer">
      <p>DealerOS - Ihr digitaler Fahrzeug-Assistent</p>
      <p>
        <a href="${data.settingsUrl}">Benachrichtigungseinstellungen</a>${data.unsubscribeUrl ? ` · <a href="${data.unsubscribeUrl}">Abmelden</a>` : ''}
      </p>
    </div>
  `);
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
  unsubscribeUrl?: string;
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
    <div class="footer">
      <p>DealerOS - Ihr digitaler Fahrzeug-Assistent</p>
      <p>
        <a href="${data.settingsUrl}">Benachrichtigungseinstellungen</a>${data.unsubscribeUrl ? ` · <a href="${data.unsubscribeUrl}">Abmelden</a>` : ''}
      </p>
    </div>
  `);
}

// ============================================================================
// Quote Expiry Reminder
// ============================================================================
export interface QuoteExpiryEmailData {
  dealerName: string;
  quotes: Array<{
    id: string;
    quoteNumber: string;
    customerName: string;
    total: number;
    validUntil: string;
    daysLeft: number;
  }>;
  dashboardUrl: string;
  settingsUrl: string;
  unsubscribeUrl: string;
}

export function quoteExpiryEmail(data: QuoteExpiryEmailData): string {
  const quotesList = data.quotes.map(q => {
    const urgencyColor = q.daysLeft <= 1 ? '#dc2626' : q.daysLeft <= 3 ? '#f59e0b' : '#3b82f6';
    const urgencyText = q.daysLeft === 0 ? 'Läuft heute ab!' : 
                        q.daysLeft === 1 ? 'Läuft morgen ab!' : 
                        `Noch ${q.daysLeft} Tage`;
    
    return `
      <div class="vehicle-card">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div>
            <h4 style="margin: 0 0 5px 0;">Offerte ${q.quoteNumber}</h4>
            <p style="margin: 0; color: #64748b;">👤 ${q.customerName}</p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; font-size: 18px; font-weight: bold; color: #1e293b;">
              CHF ${(q.total / 100).toLocaleString('de-CH')}
            </p>
            <p style="margin: 5px 0 0 0; color: ${urgencyColor}; font-weight: 600;">
              ⏰ ${urgencyText}
            </p>
          </div>
        </div>
        <p style="margin: 10px 0 0 0; font-size: 13px; color: #64748b;">
          Gültig bis: ${new Date(q.validUntil).toLocaleDateString('de-CH')}
        </p>
      </div>
    `;
  }).join('');

  const totalValue = data.quotes.reduce((sum, q) => sum + q.total, 0);

  return baseTemplate(`
    <div class="header" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
      <h1>⏰ Offerten laufen bald ab!</h1>
    </div>
    <div class="content">
      <p>Hallo ${data.dealerName},</p>
      
      <p>Die folgenden <strong>${data.quotes.length} Offerten</strong> laufen in Kürze ab:</p>
      
      <div class="stat-box" style="text-align: center; margin: 20px 0;">
        <div class="stat-number">CHF ${(totalValue / 100).toLocaleString('de-CH')}</div>
        <div>Gesamtwert offener Offerten</div>
      </div>
      
      ${quotesList}
      
      <div style="background: #fef3c7; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h4 style="margin: 0 0 10px 0;">💡 Tipps für abschlussbereite Kunden:</h4>
        <ul style="margin: 0; padding-left: 20px;">
          <li>Rufen Sie den Kunden persönlich an</li>
          <li>Fragen Sie nach offenen Fragen oder Bedenken</li>
          <li>Bieten Sie ggf. einen kleinen Bonus für schnelle Entscheidung</li>
          <li>Bei Bedarf: Offerte verlängern und neu senden</li>
        </ul>
      </div>
      
      <p style="text-align: center;">
        <a href="${data.dashboardUrl}" class="button">Offerten verwalten →</a>
      </p>
    </div>
    <div class="footer">
      <p>DealerOS - Ihr digitaler Fahrzeug-Assistent</p>
      <p>
        <a href="${data.settingsUrl}">Benachrichtigungseinstellungen</a> · 
        <a href="${data.unsubscribeUrl}">Abmelden</a>
      </p>
    </div>
  `);
}

// ============================================================================
// Invoice Overdue Reminder
// ============================================================================
export interface InvoiceOverdueEmailData {
  dealerName: string;
  invoices: Array<{
    id: string;
    invoiceNumber: string;
    customerName: string;
    total: number;
    dueDate: string;
    daysOverdue: number;
  }>;
  dashboardUrl: string;
  settingsUrl: string;
  unsubscribeUrl: string;
}

// ============================================================================
// Lead Status Change
// ============================================================================
export interface LeadStatusChangeEmailData {
  dealerName: string;
  leadName: string;
  leadEmail?: string;
  leadPhone?: string;
  oldStatus: string;
  newStatus: string;
  vehicleInfo?: string;
  dashboardUrl: string;
  settingsUrl: string;
  unsubscribeUrl?: string;
}

const STATUS_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  new: { label: 'Neu', emoji: '🆕', color: '#3b82f6' },
  contacted: { label: 'Kontaktiert', emoji: '📞', color: '#8b5cf6' },
  qualified: { label: 'Qualifiziert', emoji: '✅', color: '#10b981' },
  negotiating: { label: 'In Verhandlung', emoji: '💬', color: '#f59e0b' },
  test_drive: { label: 'Probefahrt', emoji: '🚗', color: '#06b6d4' },
  won: { label: 'Gewonnen', emoji: '🎉', color: '#22c55e' },
  lost: { label: 'Verloren', emoji: '❌', color: '#ef4444' },
  archived: { label: 'Archiviert', emoji: '📁', color: '#6b7280' },
};

export function leadStatusChangeEmail(data: LeadStatusChangeEmailData): string {
  const oldStatusInfo = STATUS_LABELS[data.oldStatus] || { label: data.oldStatus, emoji: '📊', color: '#6b7280' };
  const newStatusInfo = STATUS_LABELS[data.newStatus] || { label: data.newStatus, emoji: '📊', color: '#6b7280' };
  
  const isPositive = ['qualified', 'negotiating', 'test_drive', 'won'].includes(data.newStatus);
  const headerColor = isPositive 
    ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
    : data.newStatus === 'lost' 
      ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
      : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)';

  return baseTemplate(`
    <div class="header" style="background: ${headerColor};">
      <h1>📊 Lead Status geändert</h1>
    </div>
    <div class="content">
      <p>Hallo ${data.dealerName},</p>
      
      <p>Der Status eines Leads wurde aktualisiert:</p>
      
      <div class="lead-info">
        <p><strong>👤 Name:</strong> ${data.leadName}</p>
        ${data.leadEmail ? `<p><strong>📧 E-Mail:</strong> <a href="mailto:${data.leadEmail}">${data.leadEmail}</a></p>` : ''}
        ${data.leadPhone ? `<p><strong>📞 Telefon:</strong> <a href="tel:${data.leadPhone}">${data.leadPhone}</a></p>` : ''}
        ${data.vehicleInfo ? `<p><strong>🚗 Fahrzeug:</strong> ${data.vehicleInfo}</p>` : ''}
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <div style="display: inline-block; padding: 15px 25px; background: #f1f5f9; border-radius: 8px;">
          <span style="color: ${oldStatusInfo.color}; font-weight: 600;">
            ${oldStatusInfo.emoji} ${oldStatusInfo.label}
          </span>
          <span style="margin: 0 15px; color: #64748b;">→</span>
          <span style="color: ${newStatusInfo.color}; font-weight: 600; font-size: 18px;">
            ${newStatusInfo.emoji} ${newStatusInfo.label}
          </span>
        </div>
      </div>
      
      ${data.newStatus === 'won' ? `
        <div style="background: #f0fdf4; border: 1px solid #22c55e; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
          <p style="font-size: 24px; margin: 0;">🎉 Herzlichen Glückwunsch!</p>
          <p style="margin: 10px 0 0 0; color: #15803d;">Sie haben diesen Lead erfolgreich abgeschlossen!</p>
        </div>
      ` : ''}
      
      ${data.newStatus === 'lost' ? `
        <div style="background: #fef2f2; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <p style="margin: 0;"><strong>💡 Nicht aufgeben!</strong></p>
          <p style="margin: 10px 0 0 0; color: #7f1d1d; font-size: 14px;">
            Manchmal ändern sich Kundenbedürfnisse. Markieren Sie einen Folgetermin in 3-6 Monaten.
          </p>
        </div>
      ` : ''}
      
      <p style="text-align: center;">
        <a href="${data.dashboardUrl}" class="button">Lead Details ansehen →</a>
      </p>
    </div>
    <div class="footer">
      <p>DealerOS - Ihr digitaler Fahrzeug-Assistent</p>
      <p>
        <a href="${data.settingsUrl}">Benachrichtigungseinstellungen</a>${data.unsubscribeUrl ? ` · <a href="${data.unsubscribeUrl}">Abmelden</a>` : ''}
      </p>
    </div>
  `);
}

// ============================================================================
// Quote Accepted
// ============================================================================
export interface QuoteAcceptedEmailData {
  dealerName: string;
  quoteNumber: string;
  customerName: string;
  total: number;
  vehicleMake?: string;
  vehicleModel?: string;
  dashboardUrl: string;
  settingsUrl: string;
  unsubscribeUrl?: string;
}

export function quoteAcceptedEmail(data: QuoteAcceptedEmailData): string {
  const vehicleInfo = data.vehicleMake && data.vehicleModel 
    ? `${data.vehicleMake} ${data.vehicleModel}` 
    : undefined;

  return baseTemplate(`
    <div class="header" style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);">
      <h1>✅ Offerte angenommen!</h1>
    </div>
    <div class="content">
      <p>Hallo ${data.dealerName},</p>
      
      <div style="background: #f0fdf4; border: 2px solid #22c55e; border-radius: 12px; padding: 25px; text-align: center; margin: 20px 0;">
        <p style="font-size: 32px; margin: 0;">🎉</p>
        <p style="font-size: 20px; font-weight: bold; color: #15803d; margin: 10px 0;">
          Grossartige Neuigkeiten!
        </p>
        <p style="margin: 0; color: #166534;">
          Ihre Offerte wurde angenommen!
        </p>
      </div>
      
      <div class="vehicle-card" style="border-left: 4px solid #22c55e;">
        <h4 style="margin: 0 0 15px 0;">Offerten-Details</h4>
        <table style="margin: 0;">
          <tr>
            <td style="padding: 8px 0; border: none;"><strong>Offerten-Nr.:</strong></td>
            <td style="padding: 8px 0; border: none;">${data.quoteNumber}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border: none;"><strong>Kunde:</strong></td>
            <td style="padding: 8px 0; border: none;">${data.customerName}</td>
          </tr>
          ${vehicleInfo ? `
          <tr>
            <td style="padding: 8px 0; border: none;"><strong>Fahrzeug:</strong></td>
            <td style="padding: 8px 0; border: none;">${vehicleInfo}</td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 8px 0; border: none;"><strong>Gesamtbetrag:</strong></td>
            <td style="padding: 8px 0; border: none; font-size: 20px; font-weight: bold; color: #22c55e;">
              CHF ${(data.total / 100).toLocaleString('de-CH')}
            </td>
          </tr>
        </table>
      </div>
      
      <div style="background: #f0f9ff; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h4 style="margin: 0 0 10px 0;">📋 Nächste Schritte</h4>
        <ol style="margin: 0; padding-left: 20px; color: #1e40af;">
          <li>Rechnung erstellen und versenden</li>
          <li>Liefertermin mit Kunden vereinbaren</li>
          <li>Fahrzeugübergabe vorbereiten</li>
          <li>MFK/Versicherung prüfen</li>
        </ol>
      </div>
      
      <p style="text-align: center;">
        <a href="${data.dashboardUrl}" class="button" style="background: #22c55e;">Offerte ansehen & Rechnung erstellen →</a>
      </p>
    </div>
    <div class="footer">
      <p>DealerOS - Ihr digitaler Fahrzeug-Assistent</p>
      <p>
        <a href="${data.settingsUrl}">Benachrichtigungseinstellungen</a>${data.unsubscribeUrl ? ` · <a href="${data.unsubscribeUrl}">Abmelden</a>` : ''}
      </p>
    </div>
  `);
}

// ============================================================================
// Invoice Overdue Reminder
// ============================================================================
export function invoiceOverdueEmail(data: InvoiceOverdueEmailData): string {
  const invoicesList = data.invoices.map(inv => {
    const urgencyColor = inv.daysOverdue >= 30 ? '#dc2626' : inv.daysOverdue >= 14 ? '#f59e0b' : '#ea580c';
    
    return `
      <div class="vehicle-card" style="border-left: 4px solid ${urgencyColor};">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div>
            <h4 style="margin: 0 0 5px 0;">Rechnung ${inv.invoiceNumber}</h4>
            <p style="margin: 0; color: #64748b;">👤 ${inv.customerName}</p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; font-size: 18px; font-weight: bold; color: #1e293b;">
              CHF ${(inv.total / 100).toLocaleString('de-CH')}
            </p>
            <p style="margin: 5px 0 0 0; color: ${urgencyColor}; font-weight: 600;">
              📅 ${inv.daysOverdue} Tage überfällig
            </p>
          </div>
        </div>
        <p style="margin: 10px 0 0 0; font-size: 13px; color: #64748b;">
          Fällig seit: ${new Date(inv.dueDate).toLocaleDateString('de-CH')}
        </p>
      </div>
    `;
  }).join('');

  const totalOverdue = data.invoices.reduce((sum, inv) => sum + inv.total, 0);

  return baseTemplate(`
    <div class="header" style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);">
      <h1>⚠️ Überfällige Rechnungen</h1>
    </div>
    <div class="content">
      <p>Hallo ${data.dealerName},</p>
      
      <p>Die folgenden <strong>${data.invoices.length} Rechnungen</strong> sind überfällig:</p>
      
      <div class="stat-box" style="text-align: center; margin: 20px 0; background: #fef2f2;">
        <div class="stat-number" style="color: #dc2626;">CHF ${(totalOverdue / 100).toLocaleString('de-CH')}</div>
        <div style="color: #991b1b;">Ausstehende Forderungen</div>
      </div>
      
      ${invoicesList}
      
      <div style="background: #fef2f2; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h4 style="margin: 0 0 10px 0; color: #991b1b;">📋 Empfohlene Massnahmen:</h4>
        <ul style="margin: 0; padding-left: 20px; color: #7f1d1d;">
          <li><strong>1-14 Tage:</strong> Freundliche Zahlungserinnerung per E-Mail</li>
          <li><strong>15-30 Tage:</strong> Telefonische Nachfrage</li>
          <li><strong>30+ Tage:</strong> Formelle Mahnung mit Frist</li>
          <li>Prüfen Sie, ob Teilzahlungen vereinbart werden können</li>
        </ul>
      </div>
      
      <p style="text-align: center;">
        <a href="${data.dashboardUrl}" class="button" style="background: #dc2626;">Rechnungen verwalten →</a>
      </p>
    </div>
    <div class="footer">
      <p>DealerOS - Ihr digitaler Fahrzeug-Assistent</p>
      <p>
        <a href="${data.settingsUrl}">Benachrichtigungseinstellungen</a> · 
        <a href="${data.unsubscribeUrl}">Abmelden</a>
      </p>
    </div>
  `);
}

// ============================================================================
// Test Drive Notifications
// ============================================================================

export interface TestDriveBookingEmailData {
  dealerName: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleVariant?: string;
  scheduledAt: string; // ISO date string
  notes?: string;
  dashboardUrl: string;
  settingsUrl: string;
}

export function testDriveBookingDealerEmail(data: TestDriveBookingEmailData): string {
  const date = new Date(data.scheduledAt);
  const formattedDate = date.toLocaleDateString('de-CH', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const formattedTime = date.toLocaleTimeString('de-CH', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  const vehicleInfo = data.vehicleMake && data.vehicleModel
    ? `${data.vehicleMake} ${data.vehicleModel}${data.vehicleVariant ? ` ${data.vehicleVariant}` : ''}`
    : 'Kein bestimmtes Fahrzeug';

  return baseTemplate(`
    <div class="header" style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);">
      <h1>🚗 Neue Probefahrt-Anfrage!</h1>
    </div>
    <div class="content">
      <p>Hallo ${data.dealerName},</p>
      
      <p>Sie haben eine neue Probefahrt-Anfrage erhalten:</p>
      
      <div class="lead-info" style="background: #ecfeff; border-left-color: #06b6d4;">
        <p><strong>👤 Kunde:</strong> ${data.customerName}</p>
        ${data.customerEmail ? `<p><strong>📧 E-Mail:</strong> <a href="mailto:${data.customerEmail}">${data.customerEmail}</a></p>` : ''}
        ${data.customerPhone ? `<p><strong>📞 Telefon:</strong> <a href="tel:${data.customerPhone}">${data.customerPhone}</a></p>` : ''}
        <p><strong>🚙 Fahrzeug:</strong> ${vehicleInfo}</p>
      </div>
      
      <div class="stat-box" style="text-align: center; background: #f0fdfa;">
        <p style="margin: 0; color: #0d9488; font-weight: 600;">📅 Gewünschter Termin</p>
        <div class="stat-number" style="color: #0891b2; font-size: 22px;">${formattedDate}</div>
        <div style="font-size: 18px; color: #0d9488;">${formattedTime} Uhr</div>
      </div>
      
      ${data.notes ? `
        <p><strong>Nachricht des Kunden:</strong></p>
        <blockquote style="background: #f8fafc; padding: 15px; border-left: 4px solid #06b6d4; margin: 15px 0;">
          ${data.notes}
        </blockquote>
      ` : ''}
      
      <div class="warning-box" style="background: #fef3c7; border-left-color: #f59e0b;">
        <p style="margin: 0;"><strong>💡 Tipp:</strong> Kontaktieren Sie den Kunden zeitnah, um den Termin zu bestätigen.</p>
      </div>
      
      <p style="text-align: center;">
        <a href="${data.dashboardUrl}" class="button" style="background: #0891b2;">Probefahrt verwalten →</a>
      </p>
    </div>
  `);
}

export interface TestDriveConfirmationEmailData {
  customerName: string;
  dealerName: string;
  dealerPhone?: string;
  dealerAddress?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleVariant?: string;
  scheduledAt: string;
}

export function testDriveConfirmationCustomerEmail(data: TestDriveConfirmationEmailData): string {
  const date = new Date(data.scheduledAt);
  const formattedDate = date.toLocaleDateString('de-CH', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const formattedTime = date.toLocaleTimeString('de-CH', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  const vehicleInfo = data.vehicleMake && data.vehicleModel
    ? `${data.vehicleMake} ${data.vehicleModel}${data.vehicleVariant ? ` ${data.vehicleVariant}` : ''}`
    : 'Wird bei Termin besprochen';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${STYLES}
</head>
<body>
  <div class="container">
    <div class="header" style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);">
      <h1>🚗 Probefahrt-Anfrage erhalten!</h1>
    </div>
    <div class="content">
      <p>Guten Tag ${data.customerName},</p>
      
      <p>Vielen Dank für Ihre Probefahrt-Anfrage! Wir haben diese erhalten und werden uns in Kürze bei Ihnen melden.</p>
      
      <div class="stat-box" style="text-align: center; background: #f0fdfa;">
        <p style="margin: 0; color: #0d9488; font-weight: 600;">📅 Ihr gewünschter Termin</p>
        <div class="stat-number" style="color: #0891b2; font-size: 22px;">${formattedDate}</div>
        <div style="font-size: 18px; color: #0d9488;">${formattedTime} Uhr</div>
      </div>
      
      <div class="vehicle-card">
        <p style="margin: 0;"><strong>🚙 Fahrzeug:</strong> ${vehicleInfo}</p>
      </div>
      
      <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h4 style="margin: 0 0 15px 0;">📍 ${data.dealerName}</h4>
        ${data.dealerAddress ? `<p style="margin: 5px 0; color: #64748b;">${data.dealerAddress}</p>` : ''}
        ${data.dealerPhone ? `<p style="margin: 5px 0;"><a href="tel:${data.dealerPhone}">${data.dealerPhone}</a></p>` : ''}
      </div>
      
      <div class="warning-box" style="background: #dbeafe; border-left-color: #3b82f6;">
        <p style="margin: 0;"><strong>ℹ️ Hinweis:</strong> Bitte bringen Sie Ihren Führerausweis zur Probefahrt mit.</p>
      </div>
      
      <p>Wir freuen uns auf Ihren Besuch!</p>
      
      <p>Mit freundlichen Grüssen,<br><strong>${data.dealerName}</strong></p>
    </div>
    <div class="footer">
      <p>Diese E-Mail wurde automatisch von DealerOS versendet.</p>
    </div>
  </div>
</body>
</html>
  `;
}

// Test Drive Status Update Emails
export interface TestDriveStatusEmailData {
  customerName: string;
  dealerName: string;
  dealerPhone?: string;
  dealerAddress?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleVariant?: string;
  scheduledAt: string;
  cancellationReason?: string;
}

export function testDriveConfirmedEmail(data: TestDriveStatusEmailData): string {
  const date = new Date(data.scheduledAt);
  const formattedDate = date.toLocaleDateString('de-CH', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const formattedTime = date.toLocaleTimeString('de-CH', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  const vehicleInfo = data.vehicleMake && data.vehicleModel
    ? `${data.vehicleMake} ${data.vehicleModel}${data.vehicleVariant ? ` ${data.vehicleVariant}` : ''}`
    : 'Wird bei Termin besprochen';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${STYLES}
</head>
<body>
  <div class="container">
    <div class="header" style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);">
      <h1>✅ Probefahrt bestätigt!</h1>
    </div>
    <div class="content">
      <p>Guten Tag ${data.customerName},</p>
      
      <p>Ihre Probefahrt wurde <strong>bestätigt</strong>. Wir freuen uns auf Ihren Besuch!</p>
      
      <div class="stat-box" style="text-align: center; background: #f0fdf4;">
        <p style="margin: 0; color: #16a34a; font-weight: 600;">📅 Ihr Termin</p>
        <div class="stat-number" style="color: #22c55e; font-size: 22px;">${formattedDate}</div>
        <div style="font-size: 18px; color: #16a34a;">${formattedTime} Uhr</div>
      </div>
      
      <div class="vehicle-card">
        <p style="margin: 0;"><strong>🚙 Fahrzeug:</strong> ${vehicleInfo}</p>
      </div>
      
      <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h4 style="margin: 0 0 15px 0;">📍 ${data.dealerName}</h4>
        ${data.dealerAddress ? `<p style="margin: 5px 0; color: #64748b;">${data.dealerAddress}</p>` : ''}
        ${data.dealerPhone ? `<p style="margin: 5px 0;"><a href="tel:${data.dealerPhone}">${data.dealerPhone}</a></p>` : ''}
      </div>
      
      <div class="warning-box" style="background: #dbeafe; border-left-color: #3b82f6;">
        <p style="margin: 0;"><strong>📋 Bitte mitbringen:</strong></p>
        <ul style="margin: 10px 0 0 0; padding-left: 20px;">
          <li>Gültiger Führerausweis</li>
          <li>Ausweis/ID</li>
        </ul>
      </div>
      
      <p>Bei Fragen oder Änderungswünschen erreichen Sie uns jederzeit.</p>
      
      <p>Freundliche Grüsse,<br><strong>${data.dealerName}</strong></p>
    </div>
    <div class="footer">
      <p>Diese E-Mail wurde automatisch von DealerOS versendet.</p>
    </div>
  </div>
</body>
</html>
  `;
}

export function testDriveCancelledEmail(data: TestDriveStatusEmailData): string {
  const date = new Date(data.scheduledAt);
  const formattedDate = date.toLocaleDateString('de-CH', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const formattedTime = date.toLocaleTimeString('de-CH', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  const vehicleInfo = data.vehicleMake && data.vehicleModel
    ? `${data.vehicleMake} ${data.vehicleModel}${data.vehicleVariant ? ` ${data.vehicleVariant}` : ''}`
    : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${STYLES}
</head>
<body>
  <div class="container">
    <div class="header" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">
      <h1>❌ Probefahrt abgesagt</h1>
    </div>
    <div class="content">
      <p>Guten Tag ${data.customerName},</p>
      
      <p>Leider müssen wir Ihnen mitteilen, dass Ihre Probefahrt <strong>abgesagt</strong> wurde.</p>
      
      <div class="stat-box" style="text-align: center; background: #fef2f2;">
        <p style="margin: 0; color: #dc2626; font-weight: 600; text-decoration: line-through;">📅 ${formattedDate}</p>
        <p style="margin: 5px 0; color: #dc2626; text-decoration: line-through;">${formattedTime} Uhr</p>
        ${vehicleInfo ? `<p style="margin: 5px 0; color: #991b1b;">${vehicleInfo}</p>` : ''}
      </div>
      
      ${data.cancellationReason ? `
        <div class="warning-box" style="background: #fef3c7; border-left-color: #f59e0b;">
          <p style="margin: 0;"><strong>Grund:</strong> ${data.cancellationReason}</p>
        </div>
      ` : ''}
      
      <p>Gerne können Sie einen neuen Termin vereinbaren. Kontaktieren Sie uns:</p>
      
      <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h4 style="margin: 0 0 15px 0;">📍 ${data.dealerName}</h4>
        ${data.dealerPhone ? `<p style="margin: 5px 0;"><a href="tel:${data.dealerPhone}">${data.dealerPhone}</a></p>` : ''}
      </div>
      
      <p>Wir entschuldigen uns für die Unannehmlichkeiten.</p>
      
      <p>Freundliche Grüsse,<br><strong>${data.dealerName}</strong></p>
    </div>
    <div class="footer">
      <p>Diese E-Mail wurde automatisch von DealerOS versendet.</p>
    </div>
  </div>
</body>
</html>
  `;
}
