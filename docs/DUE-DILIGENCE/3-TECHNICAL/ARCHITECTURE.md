# System Architecture

> System design, data flow, and architectural decisions

---

## 🏗️ High-Level Architecture

```mermaid
flowchart TB
    subgraph Clients["Client Layer"]
        Desktop[Desktop Browser]
        Mobile[Mobile Browser]
        Tablet[Tablet Browser]
    end
    
    subgraph Edge["Edge Layer (Vercel)"]
        CDN[Global CDN]
        EdgeFn[Edge Functions]
        Middleware[i18n Middleware]
    end
    
    subgraph App["Application Layer (Next.js 16)"]
        direction TB
        AppRouter[App Router]
        ServerComp[Server Components]
        ClientComp[Client Components]
        ServerActions[Server Actions]
        APIRoutes[API Routes]
    end
    
    subgraph Services["Service Layer"]
        direction TB
        AuthService[Auth Service]
        VehicleService[Vehicle Service]
        LeadService[Lead Service]
        BillingService[Billing Service]
    end
    
    subgraph Data["Data Layer (Supabase EU)"]
        DB[(PostgreSQL 15)]
        Auth[Supabase Auth]
        Storage[Supabase Storage]
        Realtime[Realtime WS]
    end
    
    subgraph External["External Services"]
        Stripe[Stripe Payments]
        Resend[Resend Email]
        WhatsApp[WhatsApp Business]
        Bexio[Bexio Accounting]
    end
    
    Clients --> Edge
    Edge --> App
    App --> Services
    Services --> Data
    Services --> External
```

---

## 📁 Application Structure

```
dealer-os/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── [locale]/             # i18n locale prefix
│   │   │   ├── (auth)/           # Auth pages (login, register)
│   │   │   ├── (marketing)/      # Public pages (landing, pricing)
│   │   │   └── dashboard/        # Protected app
│   │   │       ├── page.tsx      # Dashboard home
│   │   │       ├── fahrzeuge/    # Vehicles
│   │   │       ├── leads/        # Lead management
│   │   │       ├── kunden/       # Customers
│   │   │       ├── offerten/     # Quotes
│   │   │       ├── rechnungen/   # Invoices
│   │   │       ├── statistik/    # Analytics
│   │   │       └── einstellungen/# Settings
│   │   └── api/                  # API routes
│   │       ├── stripe/           # Payment webhooks
│   │       ├── webhooks/         # External webhooks
│   │       ├── export/           # Data exports
│   │       └── notifications/    # Email notifications
│   │
│   ├── components/               # React components
│   │   ├── ui/                   # shadcn/ui components
│   │   ├── forms/                # Form components
│   │   ├── dashboard/            # Dashboard widgets
│   │   └── ...
│   │
│   ├── lib/                      # Utilities
│   │   ├── supabase/             # Supabase clients
│   │   ├── stripe/               # Stripe utilities
│   │   └── utils.ts              # Helper functions
│   │
│   ├── types/                    # TypeScript types
│   │   └── database.types.ts     # Supabase generated types
│   │
│   └── i18n/                     # Internationalization
│       └── routing.ts            # Locale routing
│
├── supabase/
│   ├── migrations/               # Database migrations (15 files)
│   └── schema.sql                # Base schema
│
├── e2e/                          # Playwright E2E tests
│   ├── auth.spec.ts
│   ├── vehicles.spec.ts
│   └── ... (13 test files)
│
├── messages/                     # i18n translation files
│   ├── de.json                   # German (primary)
│   ├── en.json                   # English
│   ├── fr.json                   # French
│   ├── it.json                   # Italian
│   └── sr.json                   # Serbian
│
└── public/                       # Static assets
```

---

## 🔄 Data Flow Patterns

### Server Component Pattern (Primary)

```mermaid
sequenceDiagram
    participant B as Browser
    participant V as Vercel Edge
    participant SC as Server Component
    participant S as Supabase
    
    B->>V: Request /dashboard
    V->>SC: Render Server Component
    SC->>S: Query with RLS
    S-->>SC: Data (filtered by RLS)
    SC-->>V: HTML + RSC Payload
    V-->>B: Complete Page
```

### Server Action Pattern (Mutations)

```mermaid
sequenceDiagram
    participant B as Browser
    participant CC as Client Component
    participant SA as Server Action
    participant S as Supabase
    
    B->>CC: User submits form
    CC->>SA: Call server action
    SA->>SA: Validate with Zod
    SA->>S: Insert/Update with RLS
    S-->>SA: Result
    SA-->>CC: Response
    CC->>CC: revalidatePath()
    CC-->>B: Updated UI
```

### Webhook Pattern (External Events)

```mermaid
sequenceDiagram
    participant Stripe
    participant API as API Route
    participant S as Supabase
    
    Stripe->>API: POST /api/stripe/webhooks
    API->>API: Verify signature
    API->>API: Parse event
    API->>S: Update subscription
    API-->>Stripe: 200 OK
```

---

## 🏛️ Multi-Tenant Architecture

### Tenant Isolation via RLS

```sql
-- Every data table has dealer_id
-- RLS ensures users only see their data

CREATE POLICY "Users can view own vehicles" ON vehicles
  FOR SELECT USING (
    dealer_id IN (
      SELECT dealer_id FROM team_members 
      WHERE user_id = auth.uid()
    )
  );
```

### Tenant Hierarchy

```
User (auth.users)
  └── Team Member (team_members)
        └── Dealer (dealers)
              ├── Vehicles
              ├── Leads
              ├── Customers
              ├── Quotes
              ├── Invoices
              └── Settings
```

---

## 🔐 Authentication Architecture

```mermaid
flowchart LR
    subgraph Client
        Login[Login Form]
        Session[Session Cookie]
    end
    
    subgraph Middleware
        AuthCheck[Auth Middleware]
        Redirect[Redirect Logic]
    end
    
    subgraph Supabase
        Auth[Supabase Auth]
        JWT[JWT Tokens]
    end
    
    Login -->|Credentials| Auth
    Auth -->|JWT| Session
    Session -->|Cookie| AuthCheck
    AuthCheck -->|Valid| Protected[Protected Route]
    AuthCheck -->|Invalid| Redirect -->|/login| Login
```

---

## 🌐 Internationalization Architecture

### URL-Based Routing

```
/de/dashboard     → German
/en/dashboard     → English
/fr/dashboard     → French
/it/dashboard     → Italian
/sr/dashboard     → Serbian
```

### Implementation

```typescript
// src/middleware.ts
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['de', 'en', 'fr', 'it', 'sr'],
  defaultLocale: 'de',
});
```

---

## 📊 Key Architectural Decisions

### ADR-001: Next.js App Router

**Decision:** Use Next.js 16 with App Router  
**Rationale:** 
- Server Components reduce bundle size
- Built-in streaming and suspense
- Better SEO with SSR
- Future-proof architecture

### ADR-002: Supabase over Custom Backend

**Decision:** Use Supabase BaaS  
**Rationale:**
- Instant auth, database, storage
- Row-level security built-in
- PostgreSQL (no vendor lock-in)
- Rapid development

### ADR-003: Multi-Tenant via RLS

**Decision:** Use PostgreSQL RLS for multi-tenancy  
**Rationale:**
- Security at database level
- No accidental data leaks
- Simple implementation
- Scalable pattern

### ADR-004: Server Actions for Mutations

**Decision:** Use Server Actions instead of API routes  
**Rationale:**
- Type-safe end-to-end
- Automatic revalidation
- Progressive enhancement
- Reduced boilerplate

---

## 🔄 State Management

### Server State

- **Server Components:** Direct database queries
- **Server Actions:** Mutations with revalidation

### Client State

- **React Hook Form:** Form state
- **URL State:** Filters, pagination (searchParams)
- **Local State:** UI state (useState)

*No global state management library needed (Redux, Zustand)*

---

## 📈 Future Architecture Considerations

### Planned Improvements

1. **Read Replicas:** For analytics queries
2. **Queue System:** For async tasks (exports, reports)
3. **Cache Layer:** Redis for session/frequent queries
4. **Event Sourcing:** For audit trail (if required)

### Scaling Strategy

```
Current: Single Supabase instance, Vercel Edge
    ↓
Growth: Connection pooling, read replicas
    ↓
Scale: Database sharding, microservices (if needed)
```

---

*Architecture based on actual codebase analysis - February 2025*
