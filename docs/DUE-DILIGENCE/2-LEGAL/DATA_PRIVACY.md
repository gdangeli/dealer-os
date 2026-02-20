# Data Privacy & Compliance

> DSGVO, nDSG, and Swiss data protection compliance

---

## 📋 Regulatory Framework

### Applicable Regulations

| Regulation | Jurisdiction | Status |
|------------|--------------|--------|
| **nDSG** (New Swiss DPA) | Switzerland | ✅ Compliant |
| **DSGVO/GDPR** | EU | ✅ Compliant |
| **DSG** (Former Swiss DPA) | Switzerland | ✅ Compliant |

### Why DSGVO Applies

- Data processing in EU (Supabase Frankfurt)
- Potential EU customers (DACH expansion)
- Payment processing through Stripe (EU entities)

---

## 🗄️ Data Processing Overview

### Data Categories

| Category | Examples | Storage | Retention |
|----------|----------|---------|-----------|
| **Account Data** | Email, name, company | Supabase (EU) | Until deletion |
| **Vehicle Data** | Make, model, price | Supabase (EU) | Until deletion |
| **Customer/Lead Data** | Contact info, messages | Supabase (EU) | Until deletion |
| **Images** | Vehicle photos | Supabase Storage (EU) | Until deletion |
| **Payment Data** | Card details | Stripe (PCI) | Per Stripe policy |
| **Analytics** | Page views, events | Vercel Analytics | 30 days |
| **Logs** | Server logs | Vercel | 7 days |

### Data Location

```
┌─────────────────────────────────────────────┐
│              DATA FLOW                       │
├─────────────────────────────────────────────┤
│  User (Switzerland)                          │
│      ↓                                       │
│  Vercel Edge (Frankfurt/EU)                  │
│      ↓                                       │
│  Supabase (Frankfurt/EU)                     │
│      ↓                                       │
│  Stripe (EU entities, PCI compliant)         │
└─────────────────────────────────────────────┘
```

All data remains within EU/Switzerland - no US data transfers for core functionality.

---

## 👤 User Rights (DSGVO Art. 12-22)

### Implementation Status

| Right | Article | Implemented | How |
|-------|---------|-------------|-----|
| **Right to Information** | Art. 13/14 | ✅ | Privacy policy |
| **Right to Access** | Art. 15 | ✅ | Account settings |
| **Right to Rectification** | Art. 16 | ✅ | Self-service edit |
| **Right to Erasure** | Art. 17 | ✅ | Account deletion |
| **Right to Restriction** | Art. 18 | ✅ | Contact support |
| **Right to Portability** | Art. 20 | ✅ | Data export |
| **Right to Object** | Art. 21 | ✅ | Email preferences |
| **Automated Decisions** | Art. 22 | N/A | No automated decisions |

### Technical Implementation

```typescript
// Data Export (Right to Portability)
// Available via dashboard settings
- Export vehicles as CSV/Excel
- Export customers as CSV
- Export leads as CSV
- Export quotes/invoices as PDF

// Account Deletion (Right to Erasure)
// Cascade delete in database
DELETE FROM dealers WHERE user_id = [user_id]
→ Cascades to: vehicles, leads, customers, quotes, invoices
```

---

## 📄 Published Policies

### Privacy Policy

- **URL:** dealeros.ch/datenschutz
- **Languages:** DE, EN, FR, IT
- **Last Updated:** [Date]

### Cookie Policy

- **Cookies Used:** Authentication only
- **Third-Party Cookies:** Stripe (payment)
- **Analytics:** Vercel (first-party)
- **Cookie Banner:** Not required (essential only)

### Terms of Service

- **URL:** dealeros.ch/agb
- **Languages:** DE, EN, FR, IT

---

## 🔐 Technical Security Measures

### Encryption

| Data State | Method | Standard |
|------------|--------|----------|
| **In Transit** | TLS 1.3 | ✅ HTTPS everywhere |
| **At Rest** | AES-256 | ✅ Supabase default |
| **Passwords** | bcrypt | ✅ Supabase Auth |
| **Sensitive Config** | AES-256-GCM | ✅ E.g., Bexio tokens |

### Access Controls

- Row Level Security (RLS) on all tables
- JWT-based authentication
- Role-based access (owner, admin, member, viewer)
- API rate limiting

### Data Minimization

- Only collect necessary data
- No tracking beyond essential analytics
- No third-party data sharing (except payment)

---

## 📋 Data Processing Agreements (DPA)

### With Service Providers

| Provider | DPA Status | GDPR Compliant |
|----------|------------|----------------|
| **Supabase** | ✅ Signed | ✅ EU region |
| **Vercel** | ✅ In ToS | ✅ DPA available |
| **Stripe** | ✅ In ToS | ✅ PCI-DSS compliant |
| **Resend** | ✅ In ToS | ✅ |

### Sub-Processors

- Supabase: AWS Frankfurt
- Vercel: Multiple edge locations (primarily EU)
- Stripe: Payment processor network

---

## 🇨🇭 Swiss-Specific Compliance (nDSG)

### Key Requirements

| Requirement | Status |
|-------------|--------|
| **Data Processing Register** | ✅ Internal documentation |
| **Technical & Organizational Measures** | ✅ Documented |
| **Cross-Border Transfer Safeguards** | ✅ EU adequacy |
| **Data Breach Notification** | ✅ Process defined |
| **Privacy by Design** | ✅ RLS, encryption |

### Swiss Data Protection Authority

- EDÖB (Eidgenössischer Datenschutz- und Öffentlichkeitsbeauftragter)
- Notification not required for standard processing

---

## 🚨 Data Breach Procedures

### Response Plan

| Timeframe | Action |
|-----------|--------|
| **Immediate** | Contain breach, assess impact |
| **72 hours** | Notify supervisory authority (if required) |
| **Without delay** | Notify affected users (if high risk) |
| **Post-incident** | Document, review, improve |

### Breach Categories

| Severity | Notification |
|----------|--------------|
| **Low** (no personal data) | Internal only |
| **Medium** (encrypted data) | Authority optional |
| **High** (unencrypted personal data) | Authority + Users |

---

## 🤝 Customer Data Processing

### Dealer-Customer Relationship

```
DealerOS = Data Processor
Dealer = Data Controller
End Customer = Data Subject

Flow:
- Dealer collects customer data (leads, customers)
- DealerOS processes on behalf of dealer
- End customer rights go through dealer
```

### Controller Responsibilities

Dealers (as controllers) are responsible for:
- Legal basis for collecting customer data
- Informing their customers about data use
- Responding to data subject requests

---

## ✅ Compliance Checklist

### Documentation

- [x] Privacy policy published
- [x] Terms of service published
- [x] DPAs with processors
- [ ] Internal processing register (recommended)
- [ ] Data flow diagram (recommended)

### Technical

- [x] Encryption in transit (TLS)
- [x] Encryption at rest
- [x] Access controls (RLS)
- [x] Data export capability
- [x] Account deletion capability
- [x] Audit logging (basic)

### Organizational

- [x] Data breach response plan
- [ ] DPO appointment (not required <250 employees)
- [ ] Regular privacy training (recommended)

---

*Compliance status as of February 2025*
