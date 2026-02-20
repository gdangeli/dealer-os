# API Architecture

> API routes, webhooks, and integrations

---

## 📁 API Route Structure

```
src/app/api/
├── auth/
│   └── callback/route.ts           # Supabase auth callback
│
├── stripe/
│   ├── webhooks/route.ts           # Stripe webhook handler
│   ├── create-checkout-session/route.ts
│   └── create-portal-session/route.ts
│
├── webhooks/
│   └── whatsapp/route.ts           # WhatsApp webhook
│
├── invoices/
│   ├── route.ts                    # List/create invoices
│   └── [id]/route.ts               # Invoice PDF generation
│
├── quotes/
│   ├── route.ts                    # List/create quotes
│   └── [id]/route.ts               # Quote PDF generation
│
├── customers/
│   ├── route.ts                    # List/create customers
│   └── [id]/route.ts               # Update/delete customer
│
├── team/
│   ├── route.ts                    # Team operations
│   ├── invite/route.ts             # Send invitation
│   ├── accept/route.ts             # Accept invitation
│   ├── members/[id]/route.ts       # Member operations
│   └── invitations/[id]/route.ts   # Invitation operations
│
├── export/
│   ├── autoscout24/route.ts        # AutoScout24 CSV export
│   ├── tutti/route.ts              # tutti.ch export
│   └── full/route.ts               # Full data export
│
├── notifications/
│   ├── new-lead/route.ts           # New lead notification
│   ├── daily-summary/route.ts      # Daily digest
│   ├── invoice-overdue/route.ts    # Overdue reminder
│   ├── longstanding/route.ts       # Longstanding vehicles
│   ├── quote-expiry/route.ts       # Quote expiration
│   ├── test/route.ts               # Test notification
│   └── unsubscribe/route.ts        # Unsubscribe handler
│
├── whatsapp/
│   ├── send/route.ts               # Send message
│   └── test-connection/route.ts    # Test connection
│
├── admin/
│   ├── dealers/route.ts            # Admin: list dealers
│   └── impersonate/route.ts        # Admin: impersonate user
│
├── bexio/
│   └── ...                         # Bexio integration
│
└── debug/
    └── admin-check/route.ts        # Debug: check admin status
```

---

## 🔌 Primary API Routes

### Stripe Integration

#### `POST /api/stripe/create-checkout-session`
Creates Stripe Checkout session for subscription.

```typescript
// Request
{
  priceId: "price_xxx",
  successUrl: "/dashboard/einstellungen/abo?success=true",
  cancelUrl: "/dashboard/einstellungen/abo"
}

// Response
{
  sessionUrl: "https://checkout.stripe.com/..."
}
```

#### `POST /api/stripe/webhooks`
Handles Stripe webhook events.

```typescript
// Events handled:
- checkout.session.completed    // New subscription
- customer.subscription.updated // Plan change
- customer.subscription.deleted // Cancellation
- invoice.paid                  // Payment success
- invoice.payment_failed        // Payment failure
```

### PDF Generation

#### `GET /api/quotes/[id]`
Generates quote PDF.

```typescript
// Request
GET /api/quotes/[uuid]

// Response
Content-Type: application/pdf
Content-Disposition: attachment; filename="Offerte-001.pdf"
```

#### `GET /api/invoices/[id]`
Generates invoice PDF.

```typescript
// Request
GET /api/invoices/[uuid]

// Response
Content-Type: application/pdf
Content-Disposition: attachment; filename="Rechnung-001.pdf"
```

### Data Export

#### `GET /api/export/full`
Exports all dealer data.

```typescript
// Request
GET /api/export/full?format=csv

// Response
Content-Type: text/csv
// or
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
```

---

## 🔗 Webhook Handlers

### Stripe Webhooks

| Endpoint | Verifies |
|----------|----------|
| `/api/stripe/webhooks` | Stripe signature |

```typescript
// Signature verification
const sig = headers().get('stripe-signature');
const event = stripe.webhooks.constructEvent(
  body,
  sig,
  process.env.STRIPE_WEBHOOK_SECRET
);
```

### WhatsApp Webhooks

| Endpoint | Verifies |
|----------|----------|
| `/api/webhooks/whatsapp` | Meta webhook token |

---

## 📊 Data Fetching Patterns

### Server Components (Primary)

```typescript
// Most data fetching uses Server Components
// No API routes needed - direct Supabase queries

// Example: Dashboard page
export default async function DashboardPage() {
  const supabase = await createClient();
  
  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('*')
    .eq('status', 'in_stock');
  
  return <VehicleList vehicles={vehicles} />;
}
```

### Server Actions (Mutations)

```typescript
// Mutations use Server Actions
// Type-safe, automatic revalidation

'use server'

export async function createVehicle(formData: FormData) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('vehicles')
    .insert(vehicleData)
    .select()
    .single();
  
  revalidatePath('/dashboard/fahrzeuge');
  return { data, error };
}
```

### API Routes (External Only)

API routes are only used for:
- Webhook handlers (external → app)
- PDF generation (streaming response)
- File exports (CSV/Excel download)
- External integrations (Bexio OAuth)

---

## 🔐 API Authentication

### Internal Routes

```typescript
// Protected by Supabase session
export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Continue with authenticated user
}
```

### Webhook Routes

```typescript
// Protected by signature verification
export async function POST(request: Request) {
  const signature = headers().get('stripe-signature');
  
  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return Response.json({ error: 'Invalid signature' }, { status: 400 });
  }
}
```

### Admin Routes

```typescript
// Additional platform admin check
export async function GET(request: Request) {
  const supabase = await createServerClient();
  
  const { data: isAdmin } = await supabase
    .rpc('is_platform_admin', { check_user_id: user.id });
  
  if (!isAdmin) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }
}
```

---

## ⏱️ Rate Limiting

### Current Implementation

| Layer | Limit | Notes |
|-------|-------|-------|
| Vercel | 1000/day (Hobby) | Unlimited on Pro |
| Supabase | Connection pool | 500 connections |
| Stripe | Built-in | Per-endpoint limits |

### Recommended Addition

```typescript
// Add rate limiting to sensitive endpoints
import { Ratelimit } from '@upstash/ratelimit';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});

export async function POST(request: Request) {
  const { success } = await ratelimit.limit(ip);
  if (!success) {
    return Response.json({ error: 'Rate limited' }, { status: 429 });
  }
}
```

---

## 📝 API Versioning

### Current State

- No explicit API versioning
- Internal APIs only (not public)
- Breaking changes via deployment

### Future Consideration

```
If public API needed:
/api/v1/vehicles
/api/v2/vehicles
```

---

## 🔄 Error Handling

### Standard Error Response

```typescript
// Consistent error format
{
  error: string;           // Human-readable message
  code?: string;           // Error code (if applicable)
  details?: object;        // Additional context
}

// HTTP Status Codes
200 - Success
201 - Created
400 - Bad Request (validation)
401 - Unauthorized
403 - Forbidden
404 - Not Found
429 - Rate Limited
500 - Internal Error
```

### Error Handling Pattern

```typescript
export async function POST(request: Request) {
  try {
    // ... operation
    return Response.json(data);
  } catch (error) {
    console.error('API Error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## 📊 API Metrics

### Monitoring (Vercel)

- Request count per endpoint
- Response times
- Error rates
- Geographic distribution

### Logging

```typescript
// Basic logging (Vercel logs)
console.log(`[${method}] ${path} - ${status} - ${duration}ms`);

// Structured logging (recommended)
{
  timestamp: ISO string,
  method: 'POST',
  path: '/api/stripe/webhooks',
  status: 200,
  duration: 150,
  userId: 'xxx' (if available)
}
```

---

*API documentation based on actual routes - February 2025*
