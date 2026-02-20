# Product Features

> Complete feature documentation for DealerOS  
> *Current version: 0.10.0 (Beta)*

---

## 📋 Feature Overview

### Module Status Legend

| Status | Meaning |
|--------|---------|
| ✅ **Live** | Production-ready, fully implemented |
| 🚧 **Beta** | Functional but may have minor issues |
| 📋 **Planned** | On roadmap, not yet started |
| 🔮 **Vision** | Long-term, under consideration |

---

## 🚗 Core Modules

### 1. Fahrzeugverwaltung | Vehicle Management

**Status:** ✅ Live

| Feature | Status | Description |
|---------|--------|-------------|
| Vehicle CRUD | ✅ | Create, read, update, delete vehicles |
| Multi-Image Upload | ✅ | Drag & drop, reorder, main image selection |
| Image Gallery | ✅ | Lightbox view with navigation |
| Status Tracking | ✅ | In Stock, Reserved, Sold |
| Standzeit-Tracking | ✅ | Automatic days-on-lot calculation |
| CSV/Excel Import | ✅ | Bulk import from existing systems |
| AutoScout24 Export | ✅ | CSV export for manual upload |
| VIN Storage | ✅ | Vehicle identification number |
| Internal Notes | ✅ | Private dealer notes |
| Price History | 📋 | Track price changes over time |
| Duplicate Detection | 📋 | Warn on potential duplicates |

**Vehicle Fields:**
- Make, Model, Variant
- First Registration Date
- Mileage (km)
- Fuel Type (Petrol, Diesel, Electric, Hybrid, etc.)
- Transmission (Manual, Automatic)
- Power (kW/PS)
- Color
- Purchase Price / Asking Price
- VIN, Description, Internal Notes

---

### 2. Lead Management (CRM)

**Status:** ✅ Live

| Feature | Status | Description |
|---------|--------|-------------|
| Lead List | ✅ | Sortable, filterable list view |
| Kanban Board | ✅ | Visual pipeline management |
| Lead Timeline | ✅ | Activity history per lead |
| Status Workflow | ✅ | New → Contacted → Qualified → Won/Lost |
| Follow-up Dates | ✅ | Next action reminders |
| Lead Source Tracking | ✅ | Website, AutoScout, Phone, Walk-in, etc. |
| Vehicle Linking | ✅ | Associate leads with vehicles |
| Lead Notes | ✅ | Internal notes per lead |
| Search & Filter | ✅ | By name, status, source, date |
| Lead Scoring | 🔮 | AI-based priority scoring |
| Auto Follow-up | 🔮 | Automated email sequences |

**Lead Fields:**
- First Name, Last Name
- Email, Phone
- Source, Status
- Linked Vehicle
- Message, Notes
- Last Contact, Next Follow-up

---

### 3. Kundenverwaltung | Customer Management

**Status:** ✅ Live

| Feature | Status | Description |
|---------|--------|-------------|
| Customer Database | ✅ | Complete CRM |
| Contact History | ✅ | All interactions logged |
| Customer Types | ✅ | Private, Business |
| Address Management | ✅ | Full address with country |
| Customer Notes | ✅ | Internal notes |
| Link to Quotes/Invoices | ✅ | Transaction history |
| Customer Import | 📋 | Bulk import from CSV |
| Customer Merge | 📋 | Deduplicate contacts |

---

### 4. Offerten | Quotes

**Status:** ✅ Live

| Feature | Status | Description |
|---------|--------|-------------|
| Quote Creation | ✅ | Multi-line items |
| Vehicle Integration | ✅ | Auto-populate from inventory |
| Customer Integration | ✅ | Link to CRM |
| Status Workflow | ✅ | Draft → Sent → Accepted/Rejected/Expired |
| PDF Export | ✅ | Professional, branded PDF |
| Validity Period | ✅ | Configurable expiry |
| Notes/Terms | ✅ | Custom terms per quote |
| Quote Numbering | ✅ | Auto-incrementing |
| Expiry Notifications | ✅ | Email alerts before expiry |
| Convert to Invoice | 📋 | One-click conversion |
| Digital Signature | 🔮 | E-signature integration |

---

### 5. Rechnungen | Invoices

**Status:** ✅ Live

| Feature | Status | Description |
|---------|--------|-------------|
| Invoice Creation | ✅ | Multi-line items |
| Payment Tracking | ✅ | Paid, Partial, Overdue |
| Due Date Management | ✅ | Configurable payment terms |
| PDF Export | ✅ | Professional, branded PDF |
| Invoice Numbering | ✅ | Auto-incrementing |
| Overdue Alerts | ✅ | Email notifications |
| Partial Payments | ✅ | Track multiple payments |
| Bexio Sync | ✅ | Swiss accounting integration |
| Payment Reminders | 📋 | Automated reminder emails |
| Online Payment | 🔮 | Stripe/TWINT integration |

---

### 6. Dashboard & Analytics

**Status:** ✅ Live

| Feature | Status | Description |
|---------|--------|-------------|
| KPI Overview | ✅ | Vehicles, leads, revenue at a glance |
| Standzeit-Analyse | ✅ | Days-on-lot trends |
| Open Leads Widget | ✅ | New inquiries requiring action |
| Long-standing Vehicles | ✅ | Vehicles needing attention |
| Quick Actions | ✅ | Shortcuts to common tasks |
| Configurable Widgets | ✅ | Drag & drop customization |
| Sales Statistics | ✅ | Trends over time |
| Revenue Charts | ✅ | Recharts visualizations |
| Multi-Location Stats | ✅ | Per-location breakdown |
| Export to PDF/Excel | 📋 | Download reports |

---

### 7. WhatsApp Integration

**Status:** ✅ Live (Phase 1 & 2)

| Feature | Status | Description |
|---------|--------|-------------|
| Setup Wizard | ✅ | Guided configuration |
| Message Templates | ✅ | Pre-defined responses |
| Auto-Reply | ✅ | Configurable auto-responses |
| Lead Integration | 🚧 | Incoming messages as leads |
| Conversation View | 📋 | Full chat history |
| Bulk Messaging | 🔮 | Campaign broadcasts |

---

### 8. Website Widget (Embed)

**Status:** ✅ Live

| Feature | Status | Description |
|---------|--------|-------------|
| Embeddable iFrame | ✅ | Drop-in widget for dealer websites |
| Layout Options | ✅ | Grid, List, or Slider view |
| Custom Styling | ✅ | Primary color, fonts, button styles |
| Dark Mode | ✅ | For dark website backgrounds |
| Live Preview | ✅ | Test before deploying |
| Auto-Height | ✅ | Responsive iframe sizing via postMessage |
| Domain Whitelisting | ✅ | Security: limit allowed domains |
| Contact Integration | ✅ | Configurable contact URL or JS events |
| Price Toggle | ✅ | Show/hide prices in widget |
| Embed Code Generator | ✅ | Copy-paste ready code |

**Implementation Details:**
- Served from `/embed/[dealerId]` endpoint
- Query parameters for live customization
- postMessage API for parent-child communication
- SEO-friendly with Next.js server components
- Optimized images via Next.js Image

**Embed Code Example:**
```html
<iframe 
  src="https://dealeros.ch/embed/{dealerId}"
  style="width: 100%; border: none; min-height: 600px;"
  loading="lazy"
></iframe>
```

---

### 9. E-Mail-Vorlagen | Email Templates

**Status:** ✅ Live

| Feature | Status | Description |
|---------|--------|-------------|
| Template Management | ✅ | Create, edit, delete templates |
| Categories | ✅ | Greeting, Test Drive, Follow-up, etc. |
| Placeholders | ✅ | Dynamic fields (customer name, vehicle, etc.) |
| Default Templates | ✅ | One default per category |
| Template Preview | ✅ | See rendered output |
| Send from Lead | 📋 | Quick send to lead |

**Available Placeholders:**
- `{{kunde_name}}`, `{{kunde_vorname}}`, `{{kunde_nachname}}`
- `{{fahrzeug}}`, `{{fahrzeug_marke}}`, `{{fahrzeug_modell}}`
- `{{preis}}`, `{{haendler_name}}`, `{{haendler_telefon}}`
- `{{datum}}`, `{{uhrzeit}}`

---

### 10. Einstellungen | Settings

**Status:** ✅ Live

| Feature | Status | Description |
|---------|--------|-------------|
| Company Profile | ✅ | Name, address, contact |
| Logo Upload | ✅ | For quotes/invoices |
| Notification Settings | ✅ | Email preferences |
| Billing Management | ✅ | Stripe subscription |
| Multi-User (Teams) | ✅ | Invite team members |
| Multi-Location | ✅ | Manage multiple sites |
| Bexio Connection | ✅ | OAuth integration |
| Language Selection | ✅ | DE, EN, FR, IT, SR |
| Dark Mode | 📋 | Theme toggle |
| API Keys | 🔮 | For third-party access |

---

### 11. Onboarding

**Status:** ✅ Live

| Feature | Status | Description |
|---------|--------|-------------|
| Setup Wizard | ✅ | Step-by-step guide |
| Progress Tracking | ✅ | Resume where you left off |
| Company Setup | ✅ | Initial configuration |
| First Vehicle | ✅ | Guided vehicle entry |
| Team Invite | ✅ | Add colleagues |
| Completion Badge | ✅ | Mark as complete |

---

### 12. Hilfe-Center | Help Center

**Status:** ✅ Live

| Feature | Status | Description |
|---------|--------|-------------|
| FAQ | ✅ | Frequently asked questions |
| Feature Guides | ✅ | How-to documentation |
| Search | ✅ | Find answers quickly |
| In-App Access | ✅ | Accessible from dashboard |
| Contact Support | ✅ | Direct support link |
| Video Tutorials | 📋 | Explainer videos |

---

### 13. Multi-Language Support (i18n)

**Status:** ✅ Live

| Language | Code | Completeness |
|----------|------|--------------|
| 🇩🇪 German | `de` | 100% (Primary) |
| 🇬🇧 English | `en` | 100% |
| 🇫🇷 French | `fr` | 100% |
| 🇮🇹 Italian | `it` | 100% |
| 🇷🇸 Serbian | `sr` | 100% |

---

### 14. Mobile Experience

**Status:** ✅ Live

| Feature | Status | Description |
|---------|--------|-------------|
| Bottom Navigation | ✅ | iOS/Android-style tab bar |
| Swipe Actions | ✅ | Swipe-to-delete/edit gestures |
| Responsive Lists | ✅ | Touch-optimized list components |
| Safe Area Handling | ✅ | iPhone notch/home bar support |
| Touch-First UI | ✅ | Optimized tap targets (44px+) |
| Pull-to-Refresh | 📋 | Native-feel refresh gesture |
| PWA Support | 📋 | Install as app on device |

**Mobile Components:**
- `BottomNav`: Fixed bottom navigation bar (hidden on desktop)
- `SwipeActionRow`: Swipe-to-reveal action buttons
- `ResponsiveList`: Touch-optimized list with chevrons
- Locale-aware routing (de/en/fr/it/sr URL prefixes)

**Mobile UX Details:**
- Bottom nav only visible on mobile (`lg:hidden`)
- Swipe threshold: 80px for action reveal
- Active state feedback on all tappable elements
- Smooth transitions (200ms ease-out)

---

## 🔌 Integrations

| Integration | Status | Description |
|-------------|--------|-------------|
| **Supabase Auth** | ✅ Live | User authentication |
| **Stripe** | ✅ Live | Payments & subscriptions |
| **Resend** | ✅ Live | Transactional emails |
| **Bexio** | ✅ Live | Swiss accounting sync |
| **WhatsApp Business** | ✅ Live | Customer messaging |
| AutoScout24 API | 📋 Planned | Direct publishing |
| mobile.de API | 📋 Planned | German market |
| tutti.ch API | 📋 Planned | Swiss classifieds |
| Facebook Marketplace | 🔮 Vision | Social selling |
| Carfax/AutoCheck | 🔮 Vision | Vehicle history |

---

## 🗺️ Product Roadmap

### Q1 2025 (Current)
- [x] Core platform (vehicles, leads, customers)
- [x] Quotes & Invoices with PDF
- [x] Stripe billing
- [x] Bexio integration
- [x] WhatsApp integration
- [x] Multi-location support
- [x] Email templates
- [x] Help center

### Q2 2025
- [ ] AutoScout24 API integration
- [ ] Enhanced analytics & reports
- [ ] Customer import
- [ ] Dark mode
- [ ] Keyboard shortcuts

### Q3-Q4 2025
- [ ] mobile.de integration
- [ ] tutti.ch integration
- [ ] AI price recommendations
- [ ] Lead scoring
- [ ] Mobile app (PWA)

### 2026+
- [ ] B2B dealer marketplace
- [ ] Full API for third parties
- [ ] Advanced AI features
- [ ] Video tours for vehicles

---

## 🏆 Competitive Differentiation

### vs. AutoScout24 Pro Tools

| Feature | DealerOS | AutoScout24 Pro |
|---------|----------|-----------------|
| Price | 129-229 CHF | 300-500+ CHF |
| Full CRM | ✅ | ❌ |
| Quotes/Invoices | ✅ | ❌ |
| WhatsApp | ✅ | ❌ |
| Multi-platform | 📋 Coming | Single platform |
| Modern UX | ✅ | ⚠️ Legacy |

### vs. Enterprise DMS (AMAG, etc.)

| Feature | DealerOS | Enterprise DMS |
|---------|----------|----------------|
| Price | 129-229 CHF | 1000+ CHF |
| Setup Time | Minutes | Weeks |
| Complexity | Simple | Complex |
| Target | Small/Medium | Large |
| Mobile-Ready | ✅ | ⚠️ Varies |

### vs. Excel/Manual

| Feature | DealerOS | Excel |
|---------|----------|-------|
| Price | 0-229 CHF | Free |
| Automation | ✅ High | ❌ None |
| Multi-user | ✅ Built-in | ⚠️ Difficult |
| Analytics | ✅ Automatic | ❌ Manual |
| Professional | ✅ PDFs, etc. | ❌ DIY |

---

## 📱 Screenshots

*[Screenshots can be added here showing key interfaces]*

1. Dashboard Overview
2. Vehicle List
3. Lead Kanban Board
4. Quote PDF Preview
5. Analytics Charts
6. Settings Page

---

*Last Updated: February 2025*
