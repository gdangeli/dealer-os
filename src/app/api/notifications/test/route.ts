import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  sendNewLeadNotification,
  sendLeadStatusChangeNotification,
  sendStandzeitWarning,
  sendQuoteAccepted,
  sendInvoiceOverdue,
  NotificationType,
} from '@/lib/notifications';

export const dynamic = 'force-dynamic';

// Test data for each notification type
const TEST_DATA = {
  new_lead: {
    name: 'Max Mustermann',
    email: 'max.mustermann@example.com',
    phone: '+41 79 123 45 67',
    message: 'Ich interessiere mich für das Fahrzeug. Bitte kontaktieren Sie mich für eine Probefahrt.',
    source: 'website',
  },
  lead_status_change: {
    lead: {
      id: 'test-lead-id',
      name: 'Max Mustermann',
      email: 'max.mustermann@example.com',
      phone: '+41 79 123 45 67',
    },
    oldStatus: 'new',
    newStatus: 'qualified',
  },
  vehicle_standzeit_warning: {
    id: 'test-vehicle-id',
    make: 'BMW',
    model: '320d Touring',
    acquired_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days ago
    asking_price: 34900,
    purchase_price: 28500,
  },
  quote_accepted: {
    id: 'test-quote-id',
    quote_number: 'OFF-2025-0042',
    total: 4290000, // CHF 42,900.00 in cents
    customer_id: 'test-customer-id',
    customer_name: 'Peter Schneider',
    vehicle_make: 'VW',
    vehicle_model: 'Golf GTI',
  },
  invoice_overdue: {
    id: 'test-invoice-id',
    invoice_number: 'RE-2025-0018',
    total: 1580000, // CHF 15,800.00 in cents
    due_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days overdue
    customer_id: 'test-customer-id',
    customer_name: 'Hans Meier',
  },
};

type TestNotificationType = keyof typeof TEST_DATA;

export async function POST(request: NextRequest) {
  try {
    // Optional: Verify auth (only allow in development or with secret)
    const isDev = process.env.NODE_ENV === 'development';
    const authHeader = request.headers.get('authorization');
    const testSecret = process.env.NOTIFICATION_TEST_SECRET || process.env.CRON_SECRET;
    
    if (!isDev && testSecret && authHeader !== `Bearer ${testSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      dealer_id, 
      type, 
      email_override,
      custom_data,
    } = body as { 
      dealer_id: string; 
      type: NotificationType; 
      email_override?: string;
      custom_data?: Record<string, unknown>;
    };

    if (!dealer_id) {
      return NextResponse.json({ 
        error: 'Missing dealer_id',
        hint: 'Provide dealer_id in request body'
      }, { status: 400 });
    }

    if (!type || !Object.keys(TEST_DATA).includes(type)) {
      return NextResponse.json({ 
        error: 'Invalid or missing notification type',
        valid_types: Object.keys(TEST_DATA),
        hint: 'Provide type in request body'
      }, { status: 400 });
    }

    // Verify dealer exists
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: dealer, error: dealerError } = await supabase
      .from('dealers')
      .select('id, email, company_name')
      .eq('id', dealer_id)
      .single();

    if (dealerError || !dealer) {
      return NextResponse.json({ 
        error: 'Dealer not found',
        dealer_id 
      }, { status: 404 });
    }

    // If email_override is provided, temporarily override (for testing)
    // Note: This doesn't actually change the DB, just for response info
    const targetEmail = email_override || dealer.email;

    let result;
    const testType = type as TestNotificationType;
    const testData = custom_data || TEST_DATA[testType];

    switch (type) {
      case 'new_lead':
        result = await sendNewLeadNotification(dealer_id, testData as typeof TEST_DATA.new_lead);
        break;

      case 'lead_status_change':
        const statusData = testData as typeof TEST_DATA.lead_status_change;
        result = await sendLeadStatusChangeNotification(
          dealer_id,
          statusData.lead,
          statusData.oldStatus,
          statusData.newStatus
        );
        break;

      case 'vehicle_standzeit_warning':
        const vehicleData = testData as typeof TEST_DATA.vehicle_standzeit_warning;
        const days = Math.floor(
          (Date.now() - new Date(vehicleData.acquired_at).getTime()) / (1000 * 60 * 60 * 24)
        );
        result = await sendStandzeitWarning(dealer_id, vehicleData, days);
        break;

      case 'quote_accepted':
        result = await sendQuoteAccepted(dealer_id, testData as typeof TEST_DATA.quote_accepted);
        break;

      case 'invoice_overdue':
        result = await sendInvoiceOverdue(dealer_id, testData as typeof TEST_DATA.invoice_overdue);
        break;

      default:
        return NextResponse.json({ 
          error: `Test not implemented for type: ${type}` 
        }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      type,
      dealer: {
        id: dealer.id,
        email: targetEmail,
        company_name: dealer.company_name,
      },
      result,
      test_data_used: testData,
      note: email_override 
        ? 'Note: email_override does not actually change recipient. Update dealer email in DB to test different address.'
        : undefined,
    });

  } catch (error) {
    console.error('Error in notification test:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: String(error)
    }, { status: 500 });
  }
}

/**
 * GET: Show available notification types and usage info
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/notifications/test',
    method: 'POST',
    description: 'Test notification emails with sample data',
    body: {
      dealer_id: {
        type: 'string',
        required: true,
        description: 'UUID of the dealer to send test notification to',
      },
      type: {
        type: 'string',
        required: true,
        options: Object.keys(TEST_DATA),
        description: 'Type of notification to test',
      },
      custom_data: {
        type: 'object',
        required: false,
        description: 'Override default test data with custom values',
      },
    },
    example_request: {
      dealer_id: 'your-dealer-uuid',
      type: 'new_lead',
    },
    notification_types: {
      new_lead: {
        description: 'Neue Kundenanfrage eingegangen',
        preference_field: 'notification_new_lead',
      },
      lead_status_change: {
        description: 'Lead Status wurde geändert',
        preference_field: 'notification_new_lead',
      },
      vehicle_standzeit_warning: {
        description: 'Fahrzeug ist lange im Bestand (30/60/90 Tage)',
        preference_field: 'notification_longstanding_days',
      },
      quote_accepted: {
        description: 'Offerte wurde vom Kunden angenommen',
        preference_field: 'notification_quote_expiry',
      },
      invoice_overdue: {
        description: 'Rechnung ist überfällig',
        preference_field: 'notification_invoice_overdue',
      },
    },
    test_data_samples: TEST_DATA,
  });
}
