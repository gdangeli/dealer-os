# Technical Overview

> Comprehensive technical documentation for DealerOS  
> *For technical due diligence purposes*

---

## 🏗️ Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENTS                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Desktop  │  │  Mobile  │  │  Tablet  │  │   API    │    │
│  │ Browser  │  │ Browser  │  │ Browser  │  │ Clients  │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │
└───────┼─────────────┼─────────────┼─────────────┼───────────┘
        │             │             │             │
        └─────────────┴──────┬──────┴─────────────┘
                             │
┌────────────────────────────┼────────────────────────────────┐
│                      VERCEL EDGE                             │
│  ┌─────────────────────────┴─────────────────────────────┐  │
│  │              Next.js 16 Application                    │  │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────────────┐  │  │
│  │  │   App     │  │   API     │  │    Middleware     │  │  │
│  │  │  Router   │  │  Routes   │  │   (Auth/i18n)     │  │  │
│  │  └───────────┘  └───────────┘  └───────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────┴───────┐   ┌────────┴────────┐   ┌──────┴───────┐
│   SUPABASE    │   │     STRIPE      │   │   RESEND     │
│  ┌─────────┐  │   │  ┌───────────┐  │   │  ┌────────┐  │
│  │PostgreSQL│ │   │  │ Payments  │  │   │  │ Email  │  │
│  │   Auth  │  │   │  │  Billing  │  │   │  │  API   │  │
│  │ Storage │  │   │  │ Webhooks  │  │   │  └────────┘  │
│  └─────────┘  │   │  └───────────┘  │   └──────────────┘
└───────────────┘   └─────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.1.6 | React Framework (App Router) |
| **React** | 19.2.3 | UI Library |
| **TypeScript** | 5.x | Type Safety |
| **Tailwind CSS** | 4.x | Styling |
| **shadcn/ui** | Latest | UI Components |
| **Radix UI** | Latest | Accessible Primitives |
| **Recharts** | 3.7 | Charts & Visualizations |
| **next-intl** | 4.8.2 | Internationalization |
| **Lucide React** | 0.564 | Icons |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Supabase** | Latest | Backend-as-a-Service |
| **PostgreSQL** | 15.x | Database (via Supabase) |
| **Supabase Auth** | Latest | Authentication |
| **Supabase Storage** | Latest | File Storage (Images) |
| **Stripe** | 20.3.1 | Payments & Subscriptions |
| **Resend** | 6.9.2 | Transactional Email |

### Infrastructure

| Technology | Purpose |
|------------|---------|
| **Vercel** | Hosting & Edge Network |
| **Vercel Edge** | Global CDN & Functions |
| **GitHub** | Source Control |
| **GitHub Actions** | CI/CD Pipeline |

### Development & Testing

| Tool | Purpose |
|------|---------|
| **Vitest** | Unit Testing |
| **Playwright** | E2E Testing |
| **ESLint** | Code Linting |
| **Prettier** | Code Formatting |

---

## 🗄️ Database Schema

### Core Tables

```sql
-- Main entities and their relationships

dealers (1:N) → vehicles (1:N) → vehicle_images
    │                │
    │                └─→ listings (platform integrations)
    │
    ├─→ leads (customer inquiries)
    ├─→ customers (CRM)
    ├─→ quotes (proposals)
    ├─→ invoices (billing)
    ├─→ email_templates
    ├─→ whatsapp_config
    └─→ locations (multi-site support)
```

### Table Overview

| Table | Records | Description |
|-------|---------|-------------|
| `dealers` | Core | Business accounts (multi-tenant root) |
| `vehicles` | High Volume | Vehicle inventory |
| `vehicle_images` | High Volume | Vehicle photos (CDN refs) |
| `leads` | Medium Volume | Customer inquiries |
| `customers` | Medium Volume | CRM contacts |
| `quotes` | Medium Volume | Price quotations |
| `invoices` | Medium Volume | Billing documents |
| `listings` | Medium Volume | Platform integrations |
| `email_templates` | Low Volume | Email template configs |
| `lead_activities` | High Volume | Activity timeline |
| `locations` | Low Volume | Multi-site support |
| `team_members` | Low Volume | Multi-user support |

### Key Database Features

- **UUID Primary Keys:** All tables use UUIDs for global uniqueness
- **Timestamps:** `created_at`, `updated_at` on all tables (auto-updated via triggers)
- **Soft Deletes:** Not implemented (hard deletes with CASCADE)
- **Full-Text Search:** PostgreSQL native FTS on relevant fields
- **JSON/JSONB:** Used for flexible configs (dashboard_config, whatsapp_config)

---

## 🔐 Security Architecture

### Authentication

```
┌─────────────────────────────────────────────────────────┐
│                   AUTHENTICATION FLOW                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  User → Login Page → Supabase Auth → JWT Token          │
│                           │                              │
│                           ├─→ Email/Password            │
│                           ├─→ Magic Link                │
│                           └─→ (Future: OAuth)           │
│                                                          │
│  JWT Token stored in HTTP-only cookie (SSR compatible)  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Row Level Security (RLS)

**All tables have RLS enabled.** Policies ensure data isolation:

```sql
-- Example: Vehicles table RLS
CREATE POLICY "Users can view own vehicles" ON vehicles
  FOR SELECT USING (
    dealer_id IN (SELECT id FROM dealers WHERE user_id = auth.uid())
  );

-- All CRUD operations follow same pattern:
-- INSERT: WITH CHECK (dealer_id belongs to auth.uid())
-- UPDATE: USING (dealer_id belongs to auth.uid())
-- DELETE: USING (dealer_id belongs to auth.uid())
```

### Security Features

| Feature | Implementation |
|---------|----------------|
| **Data Isolation** | PostgreSQL RLS (row-level security) |
| **Auth Tokens** | JWT via Supabase (short-lived) |
| **Session Management** | HTTP-only cookies, SSR-compatible |
| **API Protection** | Auth middleware on all routes |
| **Input Validation** | Zod schemas, form validation |
| **XSS Prevention** | React's built-in escaping |
| **CSRF Protection** | SameSite cookies, origin checks |
| **Secret Management** | Vercel env vars (encrypted) |
| **HTTPS** | Enforced via Vercel |

### Encryption

| Data Type | Encryption |
|-----------|------------|
| Data in Transit | TLS 1.3 (HTTPS everywhere) |
| Data at Rest | Supabase default encryption |
| Sensitive Configs | AES-256-GCM (e.g., Bexio tokens) |
| Passwords | bcrypt (via Supabase Auth) |

---

## 📦 API Structure

### Internal API Routes

```
/api/
├── auth/
│   └── callback/           # Supabase auth callback
├── stripe/
│   ├── webhooks/           # Stripe webhook handler
│   ├── create-checkout-session/
│   └── create-portal-session/
├── webhooks/
│   └── whatsapp/           # WhatsApp Business API
├── invoices/
│   └── [id]/               # Invoice PDF generation
├── export/                 # CSV/Excel exports
└── bexio/                  # Bexio integration

/embed/
└── [dealerId]/             # Embeddable widget (public)
```

### Website Widget (Embed System)

The embed system allows dealers to display their inventory on external websites:

```
┌─────────────────────────────────────────────────────────────┐
│                    EMBED ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Dealer Website         DealerOS                            │
│  ┌──────────────┐      ┌──────────────────────────────┐    │
│  │   <iframe>   │ ←──→ │  /embed/[dealerId]           │    │
│  │              │      │  ├── Server Component        │    │
│  │  postMessage │      │  │   (auth, data fetch)      │    │
│  │  ↕ height    │      │  └── Client Component        │    │
│  │  ↕ contact   │      │      (layouts, interactivity)│    │
│  └──────────────┘      └──────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- **Server-side data loading:** Vehicle data fetched via Supabase
- **Configurable styling:** Colors, fonts, button styles, dark mode
- **Layout options:** Grid, List, Slider views
- **postMessage API:** Auto-height adjustment, contact event forwarding
- **Domain whitelisting:** Optional security restriction
- **Preview mode:** Test in settings before enabling

### Data Fetching Pattern

- **Server Components:** Direct Supabase queries (recommended)
- **Server Actions:** Form submissions, mutations
- **API Routes:** Webhooks, external integrations, PDF generation

### Rate Limiting

- Vercel: 1000 serverless function invocations/day (Hobby), unlimited (Pro)
- Supabase: Connection pooling, 500 connections default
- Stripe: Built-in rate limiting

---

## 🌐 Internationalization (i18n)

### Supported Languages

| Code | Language | Status |
|------|----------|--------|
| `de` | German | Complete (Primary) |
| `en` | English | Complete |
| `fr` | French | Complete |
| `it` | Italian | Complete |
| `sr` | Serbian | Complete |

### Implementation

- **Library:** next-intl
- **Strategy:** URL prefix routing (`/de/dashboard`, `/en/dashboard`)
- **Default:** German (`de`)
- **Translation Files:** JSON in `/messages/[locale].json`

---

## 🚀 Deployment & Infrastructure

### Vercel Configuration

```json
{
  "framework": "nextjs",
  "regions": ["fra1"],  // Frankfurt (Europe)
  "buildCommand": "npm run build",
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase_url",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase_service_key",
    "STRIPE_SECRET_KEY": "@stripe_secret_key"
  }
}
```

### CI/CD Pipeline

```
GitHub Push → Vercel Build → Preview Deploy
                   │
         (on main branch)
                   │
                   └─→ Production Deploy (dealeros.ch)
```

### Infrastructure Costs (Estimated)

| Service | Plan | Monthly Cost |
|---------|------|--------------|
| **Vercel** | Pro | $20/month |
| **Supabase** | Pro | $25/month |
| **Resend** | Free/Starter | $0-20/month |
| **Stripe** | Pay-as-you-go | 2.9% + 0.30 |
| **Domain** | dealeros.ch | ~15 CHF/year |
| **Total** | | ~$50-70/month |

*Scales with usage. Current infrastructure supports 10,000+ users.*

---

## 📊 Monitoring & Observability

### Current Setup

| Tool | Purpose |
|------|---------|
| **Vercel Analytics** | Traffic, performance, Core Web Vitals |
| **Supabase Dashboard** | Database metrics, API usage |
| **Stripe Dashboard** | Payment analytics |

### Recommended Additions

- [ ] Error tracking (Sentry)
- [ ] Application Performance Monitoring (Vercel APM)
- [ ] Log aggregation
- [ ] Uptime monitoring

---

## 🧪 Testing

### Test Coverage

| Type | Tool | Coverage |
|------|------|----------|
| **Unit Tests** | Vitest | Core utilities |
| **E2E Tests** | Playwright | Critical user flows |

### E2E Test Modules

- Authentication (login, register, logout)
- Vehicle management (CRUD, images, import)
- Lead management (list, kanban, timeline)
- Quotes & Invoices
- Settings & Profile
- WhatsApp integration
- Analytics & Dashboard

### Running Tests

```bash
# Unit tests
npm run test:unit

# E2E tests (headless)
npm run test:e2e

# E2E tests (with browser UI)
npm run test:e2e:ui
```

---

## 🔄 Scalability

### Current Architecture Supports

| Metric | Capacity |
|--------|----------|
| **Concurrent Users** | 10,000+ |
| **Database Size** | 100GB+ (Supabase Pro) |
| **File Storage** | 100GB+ (Supabase Storage) |
| **API Requests** | Unlimited (Vercel Pro) |
| **Regions** | Global (Vercel Edge) |

### Scaling Strategy

1. **Horizontal:** Vercel automatically scales serverless functions
2. **Database:** Supabase connection pooling, read replicas available
3. **Storage:** CDN-backed, global distribution
4. **Caching:** Edge caching via Vercel, ISR for static content

### Performance Optimizations

- Server-side rendering (SSR) for SEO pages
- Incremental Static Regeneration (ISR) for blog
- Image optimization via Next.js Image
- Code splitting & lazy loading
- Database query optimization (indexes)

---

## 📁 Repository Structure

```
dealer-os/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── [locale]/        # Localized routes
│   │   │   ├── (auth)/      # Auth pages
│   │   │   ├── dashboard/   # Main app
│   │   │   └── ...
│   │   ├── api/             # API routes
│   │   └── embed/           # Public widget embed
│   │       └── [dealerId]/  # Per-dealer widget
│   ├── components/          # React components
│   │   ├── dashboard/       # Dashboard widgets
│   │   ├── mobile/          # Mobile-specific components
│   │   │   ├── bottom-nav.tsx
│   │   │   ├── swipe-action.tsx
│   │   │   └── responsive-list.tsx
│   │   ├── settings/        # Settings UI (incl. widget config)
│   │   └── ui/              # shadcn/ui base components
│   ├── lib/                 # Utilities
│   ├── types/               # TypeScript types
│   └── i18n/                # i18n config
├── supabase/
│   ├── migrations/          # Database migrations
│   └── schema.sql           # Base schema
├── e2e/                     # Playwright tests
├── tests/                   # Vitest tests
├── messages/                # i18n translations
├── public/                  # Static assets
└── docs/                    # Documentation
```

---

## 📱 Mobile Architecture

### Responsive Strategy

DealerOS uses a **mobile-first progressive enhancement** approach:

```
┌─────────────────────────────────────────────────────────────┐
│                    MOBILE UI COMPONENTS                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  BottomNav (lg:hidden)                                      │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  🏠 Übersicht  🚗 Bestand  👥 Anfragen  📄 Offerten  ⚙️ │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  SwipeActionRow                                             │
│  ┌──────────────────────────────┬─────────────────────────┐ │
│  │  Row Content                 │  🗑️ Delete  ✏️ Edit    │ │
│  │  ← swipe to reveal actions   │  (revealed on swipe)   │ │
│  └──────────────────────────────┴─────────────────────────┘ │
│                                                              │
│  ResponsiveList                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  📷  Title                            Value      >     │  │
│  │       Subtitle / meta                                 │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Mobile Components

| Component | Purpose | Breakpoint |
|-----------|---------|------------|
| `BottomNav` | iOS/Android-style tab bar | Hidden on `lg:` |
| `SwipeActionRow` | Touch gestures for actions | Hidden on `lg:` |
| `ResponsiveList` | Native-feel list items | All screens |

### Touch Interactions

- **Swipe threshold:** 80px to reveal actions
- **Action width:** 80px per action button
- **Transitions:** 200ms ease-out for smooth feel
- **Safe areas:** CSS `safe-area-pb` for iPhone home bar

### Locale-Aware Navigation

Bottom nav automatically strips locale prefix for route matching:
```typescript
const normalizedPath = pathname.replace(/^\/(de|en|fr|it|sr)/, '');
```

---

## 🔑 Technical Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| **Vendor Lock-in (Supabase)** | Standard PostgreSQL, can migrate |
| **Vendor Lock-in (Vercel)** | Next.js is portable, can self-host |
| **Single Point of Failure** | Multi-region ready, failover possible |
| **Security Vulnerabilities** | RLS, regular updates, security audits |
| **Scaling Limits** | Serverless auto-scales, DB pooling |

---

## ✅ Technical Due Diligence Checklist

- [x] Modern, maintainable tech stack
- [x] Type-safe codebase (TypeScript)
- [x] Automated testing (E2E + Unit)
- [x] CI/CD pipeline
- [x] Row-level security
- [x] Scalable infrastructure
- [x] Multi-language support
- [x] Mobile-responsive
- [x] Documentation
- [ ] SOC 2 compliance (roadmap)
- [ ] Penetration testing (recommended)

---

*Last Updated: February 2025*
