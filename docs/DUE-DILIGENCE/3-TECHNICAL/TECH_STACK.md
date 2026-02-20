# Technology Stack

> Complete technology inventory with versions

---

## 📦 Production Dependencies

### Core Framework

| Package | Version | Purpose |
|---------|---------|---------|
| **next** | 16.1.6 | React Framework (App Router) |
| **react** | 19.2.3 | UI Library |
| **react-dom** | 19.2.3 | React DOM Renderer |
| **typescript** | 5.x | Type Safety |

### Styling & UI

| Package | Version | Purpose |
|---------|---------|---------|
| **tailwindcss** | 4.x | Utility-first CSS |
| **radix-ui** | 1.4.3 | Accessible UI Primitives |
| **@radix-ui/react-*** | Various | Individual Radix components |
| **lucide-react** | 0.564 | Icon Library |
| **class-variance-authority** | 0.7.1 | Component Variants |
| **clsx** | 2.1.1 | Class Merging |
| **tailwind-merge** | 3.4.1 | Tailwind Class Merging |
| **tw-animate-css** | 1.4.0 | Animation Utilities |

### Backend Services

| Package | Version | Purpose |
|---------|---------|---------|
| **@supabase/supabase-js** | 2.95.3 | Supabase Client |
| **@supabase/ssr** | 0.8.0 | SSR Support |
| **stripe** | 20.3.1 | Payment Processing |
| **@stripe/stripe-js** | 8.7.0 | Stripe Frontend |
| **resend** | 6.9.2 | Email Service |

### Forms & Validation

| Package | Version | Purpose |
|---------|---------|---------|
| **react-hook-form** | 7.71.1 | Form Management |
| **@hookform/resolvers** | 3.9.1 | Validation Resolvers |
| **zod** | 3.22.3 | Schema Validation |

### Data Handling

| Package | Version | Purpose |
|---------|---------|---------|
| **date-fns** | 4.1.0 | Date Manipulation |
| **papaparse** | 5.5.3 | CSV Parsing |
| **xlsx** | 0.18.5 | Excel Export |
| **browser-image-compression** | 2.0.2 | Image Optimization |

### Internationalization

| Package | Version | Purpose |
|---------|---------|---------|
| **next-intl** | 4.8.2 | i18n Framework |

### UI Components

| Package | Version | Purpose |
|---------|---------|---------|
| **recharts** | 3.7.0 | Charts & Visualizations |
| **@react-pdf/renderer** | 4.3.2 | PDF Generation |
| **react-dropzone** | 15.0.0 | File Upload |
| **sonner** | 2.0.7 | Toast Notifications |

### Drag & Drop

| Package | Version | Purpose |
|---------|---------|---------|
| **@dnd-kit/core** | 6.3.1 | DnD Foundation |
| **@dnd-kit/sortable** | 10.0.0 | Sortable Lists |
| **@dnd-kit/utilities** | 3.2.2 | DnD Utilities |

---

## 🧪 Development Dependencies

### Testing

| Package | Version | Purpose |
|---------|---------|---------|
| **vitest** | 4.0.18 | Unit Testing |
| **@playwright/test** | 1.58.2 | E2E Testing |
| **@testing-library/react** | 16.3.2 | Component Testing |
| **@testing-library/dom** | 10.4.1 | DOM Testing |
| **@testing-library/jest-dom** | 6.9.1 | Jest Matchers |
| **jsdom** | 28.1.0 | DOM Simulation |
| **@vitejs/plugin-react** | 5.1.4 | Vitest React Plugin |

### Linting & Formatting

| Package | Version | Purpose |
|---------|---------|---------|
| **eslint** | 9.x | Code Linting |
| **eslint-config-next** | 16.1.6 | Next.js ESLint |

### Type Definitions

| Package | Version | Purpose |
|---------|---------|---------|
| **@types/node** | 20.x | Node.js Types |
| **@types/react** | 19.x | React Types |
| **@types/react-dom** | 19.x | React DOM Types |
| **@types/papaparse** | 5.5.2 | PapaParse Types |

### Build Tools

| Package | Version | Purpose |
|---------|---------|---------|
| **@tailwindcss/postcss** | 4.x | PostCSS Plugin |
| **shadcn** | 3.8.4 | UI Component CLI |

### Video (Optional)

| Package | Version | Purpose |
|---------|---------|---------|
| **remotion** | 4.0.422 | Programmatic Video |
| **@remotion/cli** | 4.0.422 | Remotion CLI |
| **@remotion/player** | 4.0.422 | Video Player |

---

## 🖥️ Infrastructure Stack

### Hosting & Compute

| Service | Provider | Purpose |
|---------|----------|---------|
| **Application Hosting** | Vercel | Serverless Functions |
| **Edge Network** | Vercel | Global CDN |
| **Preview Deployments** | Vercel | PR Previews |

### Database & Storage

| Service | Provider | Purpose |
|---------|----------|---------|
| **Database** | Supabase | PostgreSQL 15 |
| **Auth** | Supabase Auth | User Management |
| **File Storage** | Supabase Storage | Vehicle Images |
| **Realtime** | Supabase | WebSocket (optional) |

### External Services

| Service | Provider | Purpose |
|---------|----------|---------|
| **Payments** | Stripe | Subscriptions |
| **Email** | Resend | Transactional Email |
| **Messaging** | WhatsApp Business | Customer Communication |
| **Accounting** | Bexio | Swiss Accounting |

### DevOps

| Service | Provider | Purpose |
|---------|----------|---------|
| **Source Control** | GitHub | Git Repository |
| **CI/CD** | GitHub Actions | Automated Testing |
| **Deployment** | Vercel | Auto-deploy |

---

## 📊 Technology Decisions

### Why Next.js 16?

- ✅ Server Components (reduced bundle)
- ✅ App Router (modern architecture)
- ✅ Built-in image optimization
- ✅ Incremental Static Regeneration
- ✅ Great DX (Fast Refresh)

### Why Supabase?

- ✅ PostgreSQL (no vendor lock-in)
- ✅ Row-level security built-in
- ✅ Instant APIs
- ✅ Auth, storage, realtime included
- ✅ EU data center (Frankfurt)

### Why Vercel?

- ✅ First-class Next.js support
- ✅ Global edge network
- ✅ Preview deployments
- ✅ Analytics included
- ✅ Zero-config deployment

### Why TypeScript?

- ✅ Type safety prevents bugs
- ✅ Better IDE support
- ✅ Self-documenting code
- ✅ Easier refactoring
- ✅ Better team scaling

---

## 🔄 Version Management

### Keeping Up-to-Date

```bash
# Check outdated packages
npm outdated

# Update minor versions
npm update

# Check for breaking changes
npm audit
```

### Update Frequency

| Category | Frequency |
|----------|-----------|
| Security patches | Immediate |
| Minor versions | Weekly |
| Major versions | Quarterly review |

---

## 📈 Stack Evolution

### Current (Feb 2025)

```
Next.js 16 → React 19 → TypeScript 5
                ↓
         Supabase (PostgreSQL 15)
                ↓
         Vercel Edge Network
```

### Potential Future

```
Consider when scaling:
- Redis (caching)
- Message queue (async tasks)
- Elasticsearch (search)
- CDN (media)
```

---

*Stack analysis from package.json - February 2025*
