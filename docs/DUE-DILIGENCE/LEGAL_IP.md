# Legal & Intellectual Property

> Legal structure, IP rights, and compliance documentation for DealerOS  
> *For M&A due diligence purposes*

---

## 🏢 Corporate Structure

### Company Information

| Field | Value |
|-------|-------|
| **Legal Name** | [Company Name] |
| **Legal Form** | [AG / GmbH / Einzelfirma] |
| **Registration Number** | [UID / Handelsregister Nr.] |
| **Registration Date** | [Date] |
| **Registered Address** | [Address] |
| **Canton** | [Canton], Switzerland |
| **Tax ID (MwSt)** | [CHE-xxx.xxx.xxx MWST] |

### Ownership Structure

| Shareholder | Ownership % | Role |
|-------------|-------------|------|
| [Name 1] | ___ % | Founder/CEO |
| [Name 2] | ___ % | [Role] |
| [Other] | ___ % | [Role] |

### Management

| Role | Name | Since |
|------|------|-------|
| **CEO/Geschäftsführer** | [Name] | [Date] |
| **Board of Directors** | [Name(s)] | [Date] |

---

## 💡 Intellectual Property

### Trademark & Brand

| Asset | Status | Registration |
|-------|--------|--------------|
| **"DealerOS" Name** | [Registered / Pending / Unregistered] | [CH/EU Trademark Nr.] |
| **Logo** | [Registered / Pending / Unregistered] | [Nr.] |
| **Domain: dealeros.ch** | ✅ Owned | [Registrar] |
| **Domain: dealeros.com** | [Owned / Not owned] | [Registrar] |
| **Domain: dealer-os.ch** | [Owned / Not owned] | [Registrar] |

### Source Code

| Component | IP Status | Notes |
|-----------|-----------|-------|
| **Frontend (Next.js App)** | ✅ Proprietary | 100% owned |
| **Backend Logic** | ✅ Proprietary | 100% owned |
| **Database Schema** | ✅ Proprietary | 100% owned |
| **UI Components** | Mixed | shadcn/ui (MIT License) |
| **Documentation** | ✅ Proprietary | 100% owned |

### Open Source Dependencies

The application uses open-source libraries under permissive licenses. Key dependencies:

| Package | License | Risk |
|---------|---------|------|
| **Next.js** | MIT | 🟢 Low |
| **React** | MIT | 🟢 Low |
| **TypeScript** | Apache 2.0 | 🟢 Low |
| **Tailwind CSS** | MIT | 🟢 Low |
| **shadcn/ui** | MIT | 🟢 Low |
| **Radix UI** | MIT | 🟢 Low |
| **Recharts** | MIT | 🟢 Low |
| **Supabase Client** | MIT | 🟢 Low |
| **Stripe.js** | Apache 2.0 | 🟢 Low |
| **date-fns** | MIT | 🟢 Low |
| **Lucide Icons** | ISC | 🟢 Low |

**No copyleft (GPL/AGPL) dependencies** in production code.

### Patents

| Status | Notes |
|--------|-------|
| **Patents Filed** | None |
| **Patent-Pending** | None |
| **Trade Secrets** | Business logic, pricing algorithms |

---

## 📜 Third-Party Agreements

### Critical Service Providers

| Provider | Service | Contract Type | Term |
|----------|---------|---------------|------|
| **Supabase** | Database, Auth, Storage | SaaS Subscription | Monthly |
| **Vercel** | Hosting, CDN | SaaS Subscription | Monthly |
| **Stripe** | Payments | Standard Agreement | Ongoing |
| **Resend** | Email | SaaS Subscription | Monthly |

### Service Provider Details

#### Supabase
- **Plan:** [Free / Pro / Team]
- **Data Location:** EU (Frankfurt)
- **SLA:** 99.9% uptime
- **Data Portability:** ✅ Full PostgreSQL export
- **Lock-in Risk:** 🟢 Low (standard PostgreSQL)

#### Vercel
- **Plan:** [Hobby / Pro / Enterprise]
- **Regions:** Global Edge
- **SLA:** 99.99% uptime (Enterprise)
- **Lock-in Risk:** 🟢 Low (Next.js is portable)

#### Stripe
- **Account Type:** Standard
- **Processing Region:** Switzerland / EU
- **Fees:** 2.9% + 0.30 CHF
- **Compliance:** PCI DSS Level 1

#### Resend
- **Plan:** [Free / Pro]
- **Sending Domain:** dealeros.ch
- **Lock-in Risk:** 🟢 Low (standard SMTP/API)

### No Exclusivity Agreements

The company has no exclusive agreements with any third party that would limit an acquirer's ability to:
- Change service providers
- Modify the product
- Operate in any market

---

## 📋 Compliance

### Data Protection

| Regulation | Status | Notes |
|------------|--------|-------|
| **DSGVO (EU GDPR)** | ✅ Compliant | Data processing in EU |
| **nDSG (Swiss DPA)** | ✅ Compliant | Primary jurisdiction |
| **Privacy Policy** | ✅ Published | [dealeros.ch/datenschutz] |
| **Cookie Policy** | ✅ Published | Minimal cookies (auth only) |
| **Data Processing Agreement** | ✅ With Supabase, Stripe | |

### Data Processing

| Data Type | Storage | Retention |
|-----------|---------|-----------|
| **User Accounts** | Supabase (EU) | Until deletion |
| **Vehicle Data** | Supabase (EU) | Until deletion |
| **Customer/Lead Data** | Supabase (EU) | Until deletion |
| **Images** | Supabase Storage (EU) | Until deletion |
| **Payment Data** | Stripe (PCI compliant) | Per Stripe policy |
| **Analytics** | Vercel Analytics | 30 days |
| **Logs** | Vercel | 7 days |

### User Rights Implementation

| Right | Implemented |
|-------|-------------|
| **Right to Access** | ✅ Via account settings |
| **Right to Rectification** | ✅ Via account settings |
| **Right to Erasure** | ✅ Account deletion |
| **Right to Portability** | ✅ Data export |
| **Right to Object** | ✅ Email preferences |

### Security Measures

- Encryption at rest (Supabase default)
- Encryption in transit (TLS 1.3)
- Row-level security (PostgreSQL RLS)
- Authentication via Supabase Auth
- No password storage (bcrypt hashing)
- Regular dependency updates

---

## 📄 Customer Agreements

### Terms of Service

| Document | Status | Last Updated |
|----------|--------|--------------|
| **AGB (Terms of Service)** | ✅ Published | [Date] |
| **Datenschutzerklärung (Privacy)** | ✅ Published | [Date] |
| **Impressum** | ✅ Published | [Date] |

### Customer Contract Type

- **Standard:** Click-through acceptance on signup
- **Enterprise:** Individual contracts (if any)

### Payment Terms

| Term | Value |
|------|-------|
| **Billing Cycle** | Monthly |
| **Payment Method** | Credit Card (Stripe) |
| **Currency** | CHF |
| **Auto-Renewal** | Yes |
| **Cancellation** | Anytime, effective end of period |
| **Refund Policy** | No refunds for partial periods |

---

## ⚖️ Litigation & Disputes

### Current Litigation

| Case | Status |
|------|--------|
| **Pending Lawsuits** | None |
| **Threatened Claims** | None |
| **Regulatory Actions** | None |

### Historical Litigation

| Case | Resolution |
|------|------------|
| **Past Lawsuits** | None |
| **Past Claims** | None |

---

## 🔐 Insurance

| Type | Provider | Coverage |
|------|----------|----------|
| **General Liability** | [Provider] | CHF _____ |
| **Cyber Liability** | [Provider] | CHF _____ |
| **D&O Insurance** | [Provider] | CHF _____ |

---

## 📋 Licenses & Permits

### Required Licenses

| License | Status | Notes |
|---------|--------|-------|
| **Business Registration** | ✅ | Handelsregister |
| **VAT Registration** | ✅ | MwSt-Nummer |
| **Software License** | N/A | SaaS, no special license required |

### Export Controls

- No export-controlled technology
- No government/defense customers
- No cryptocurrency features

---

## 🤝 Employment & Contractors

### Employment Contracts

| Type | Count | Contract Type |
|------|-------|---------------|
| **Full-time Employees** | _____ | Standard Swiss employment |
| **Part-time Employees** | _____ | Standard Swiss employment |
| **Contractors** | _____ | Service agreements |

### IP Assignment

| Status | Notes |
|--------|-------|
| **Employee IP Assignment** | ✅ Standard employment contracts |
| **Contractor IP Assignment** | ✅ Work-for-hire clauses |
| **Founder IP Assignment** | ✅ All IP assigned to company |

### Non-Compete Agreements

| Type | Duration | Enforceability |
|------|----------|----------------|
| **Employee Non-Compete** | [X months] | Swiss law limitations |
| **Founder Non-Compete** | [X months] | [Notes] |

---

## 🔍 Due Diligence Checklist

### Documents Available on Request

- [ ] Certificate of Incorporation
- [ ] Shareholder Agreement
- [ ] Board Minutes
- [ ] Cap Table
- [ ] Employment Contracts
- [ ] Contractor Agreements
- [ ] Service Provider Contracts
- [ ] Privacy Policy (full legal version)
- [ ] Terms of Service (full legal version)
- [ ] Insurance Policies
- [ ] Tax Returns (last 3 years)
- [ ] Financial Statements
- [ ] Bank Statements
- [ ] Trademark Registrations
- [ ] Domain Ownership Records

---

## ⚠️ Known Risks & Disclosures

| Risk | Description | Mitigation |
|------|-------------|------------|
| **Key Person Risk** | Founder-dependent | Documenting processes |
| **Market Risk** | Niche market (Swiss dealers) | DACH expansion planned |
| **Technology Risk** | Dependency on third-party services | Multi-provider strategy |
| **Regulatory Risk** | Data protection changes | Compliance monitoring |

---

*Last Updated: February 2025*  
*Confidential - For Prospective Acquirers Only*
