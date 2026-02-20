# Revenue Model

> SaaS pricing structure and recurring revenue model

---

## 💰 Pricing Tiers

### Current Pricing (CHF)

| Plan | Monthly | Annual | Savings | Target Segment |
|------|---------|--------|---------|----------------|
| **Starter** | FREE | FREE | - | Micro (1-10 vehicles) |
| **Professional** | 129 | 1,290 | 17% | Small (10-50 vehicles) |
| **Business** | 229 | 2,290 | 17% | Medium (50+ vehicles) |
| **Enterprise** | Custom | Custom | - | Large dealer groups |

### Feature Matrix

| Feature | Starter | Professional | Business | Enterprise |
|---------|---------|--------------|----------|------------|
| Vehicles | 10 | 100 | Unlimited | Unlimited |
| Leads | 20/month | Unlimited | Unlimited | Unlimited |
| Users | 1 | 3 | 10 | Unlimited |
| Locations | 1 | 1 | 5 | Unlimited |
| Quotes/Invoices | 5/month | Unlimited | Unlimited | Unlimited |
| WhatsApp | ❌ | ✅ | ✅ | ✅ |
| Bexio Sync | ❌ | ✅ | ✅ | ✅ |
| Analytics | Basic | Full | Full | Custom |
| Priority Support | ❌ | Email | Email + Phone | Dedicated |

### Stripe Price IDs (Production)

```
Starter (Free): No Stripe integration needed
Professional Monthly: price_xxx (ENV: STRIPE_PRO_MONTHLY_PRICE_ID)
Professional Yearly:  price_xxx (ENV: STRIPE_PRO_YEARLY_PRICE_ID)
Business Monthly:     price_xxx (ENV: STRIPE_BUSINESS_MONTHLY_PRICE_ID)
Business Yearly:      price_xxx (ENV: STRIPE_BUSINESS_YEARLY_PRICE_ID)
```

---

## 📊 Revenue Metrics

### MRR/ARR Calculations

```
MRR = Σ (Active Paying Customers × Plan Price)
ARR = MRR × 12

Net New MRR = New MRR + Expansion MRR - Churned MRR
```

### Current Metrics (Template)

| Metric | Current | Previous Month | MoM Change |
|--------|---------|----------------|------------|
| **MRR** | CHF _____ | CHF _____ | ___ % |
| **ARR** | CHF _____ | CHF _____ | ___ % |
| **New MRR** | CHF _____ | CHF _____ | ___ % |
| **Expansion MRR** | CHF _____ | CHF _____ | ___ % |
| **Churned MRR** | CHF _____ | CHF _____ | ___ % |
| **Net New MRR** | CHF _____ | CHF _____ | ___ % |

### Revenue by Plan (Template)

| Plan | Customers | MRR | % of Total |
|------|-----------|-----|------------|
| **Starter** (Free) | _____ | 0 | 0% |
| **Professional** | _____ | CHF _____ | ___ % |
| **Business** | _____ | CHF _____ | ___ % |
| **Enterprise** | _____ | CHF _____ | ___ % |
| **Total** | _____ | CHF _____ | 100% |

---

## 💵 Revenue Recognition

### Billing Mechanics

- **Billing Cycle:** Monthly or Annual (prepaid)
- **Payment Method:** Credit Card via Stripe
- **Currency:** CHF (Swiss Francs)
- **Auto-Renewal:** Yes
- **Cancellation:** Anytime, effective end of billing period
- **Refunds:** No refunds for partial periods

### Annual Subscription Handling

```
Annual payment (2,290 CHF Business)
= MRR recognized: 190.83 CHF/month
= Deferred revenue: Remaining months
```

---

## 📈 Growth Levers

### Expansion Revenue Opportunities

1. **Plan Upgrades**
   - Starter → Professional (most common)
   - Professional → Business (growth-driven)
   
2. **Seat Expansion**
   - Additional team members
   - Additional locations

3. **Add-ons (Roadmap)**
   - Premium integrations
   - API access
   - Custom features

### Pricing Power

- **Competitive Position:** 5-10x cheaper than enterprise alternatives
- **Value Delivered:** Replaces 4-5 separate tools
- **Price Elasticity:** Room for modest increases (10-20%)

---

## 🎯 Revenue Targets

### Year 1 (2025)

| Scenario | Customers | Avg. Price | MRR | ARR |
|----------|-----------|------------|-----|-----|
| Conservative | 20 | 150 CHF | 3,000 | 36,000 |
| Base | 50 | 160 CHF | 8,000 | 96,000 |
| Optimistic | 100 | 170 CHF | 17,000 | 204,000 |

### Year 3 (2027)

| Scenario | Customers | Avg. Price | MRR | ARR |
|----------|-----------|------------|-----|-----|
| Conservative | 300 | 160 CHF | 48,000 | 576,000 |
| Base | 500 | 170 CHF | 85,000 | 1,020,000 |
| Optimistic | 1,000 | 180 CHF | 180,000 | 2,160,000 |

---

## 🔄 Payment Processing

### Stripe Integration

- **Account Type:** Standard (CH)
- **Processing Region:** Switzerland / EU
- **Fee Structure:** 2.9% + 0.30 CHF per successful charge
- **Payout Schedule:** T+2 days
- **3D Secure:** Enabled (SCA compliance)

### Webhook Events Handled

```typescript
// src/app/api/stripe/webhooks/route.ts
- checkout.session.completed    // New subscription
- customer.subscription.updated // Plan changes
- customer.subscription.deleted // Cancellation
- invoice.paid                  // Successful payment
- invoice.payment_failed        // Failed payment
```

---

*Fill in actual metrics before sharing*
