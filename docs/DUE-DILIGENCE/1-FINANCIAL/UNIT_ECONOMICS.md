# Unit Economics

> Customer Acquisition Cost, Lifetime Value, and Payback Period

---

## 🎯 Key Metrics Overview

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| **CAC** | <200 CHF | CHF _____ | 🟢/🟡/🔴 |
| **LTV** | >3,000 CHF | CHF _____ | 🟢/🟡/🔴 |
| **LTV:CAC** | >15:1 | ___:1 | 🟢/🟡/🔴 |
| **Payback Period** | <3 months | ___ months | 🟢/🟡/🔴 |
| **Gross Margin** | >85% | ___ % | 🟢/🟡/🔴 |

---

## 💰 Customer Acquisition Cost (CAC)

### CAC Calculation

```
CAC = Total Sales & Marketing Spend / New Customers Acquired

Example:
- Marketing spend: 1,000 CHF/month
- New customers: 10
- CAC = 100 CHF
```

### CAC by Channel (Template)

| Channel | Monthly Spend | Customers | CAC |
|---------|---------------|-----------|-----|
| Organic/SEO | CHF 0 | _____ | CHF 0 |
| Content Marketing | CHF _____ | _____ | CHF _____ |
| Google Ads | CHF _____ | _____ | CHF _____ |
| Social Media | CHF _____ | _____ | CHF _____ |
| Referrals | CHF _____ | _____ | CHF _____ |
| Partnerships | CHF _____ | _____ | CHF _____ |
| **Blended** | **CHF _____** | **_____** | **CHF _____** |

### CAC Efficiency Factors

**Low CAC Drivers:**
- Product-led growth (self-service signup)
- Organic search (dealeros.ch)
- Word-of-mouth in tight-knit dealer community
- Freemium tier as acquisition funnel

**CAC Investment Areas:**
- SEO content (blog, guides)
- Swiss automotive association partnerships
- Google Ads (targeted keywords)

---

## 📈 Customer Lifetime Value (LTV)

### LTV Calculation

```
LTV = ARPU × Gross Margin × Average Customer Lifetime

Where:
- ARPU = Average Revenue Per User (monthly)
- Gross Margin = (Revenue - COGS) / Revenue
- Customer Lifetime = 1 / Monthly Churn Rate
```

### LTV by Plan

| Plan | ARPU | Gross Margin | Lifetime | LTV |
|------|------|--------------|----------|-----|
| **Professional** | 129 CHF | 95% | ___ months | CHF _____ |
| **Business** | 229 CHF | 95% | ___ months | CHF _____ |
| **Blended** | ___ CHF | 95% | ___ months | CHF _____ |

### Example Calculation

```
Professional Plan:
- ARPU: 129 CHF/month
- Gross Margin: 95%
- Churn: 3%/month → Lifetime: 33 months
- LTV = 129 × 0.95 × 33 = 4,044 CHF
```

---

## ⏱️ Payback Period

### Calculation

```
Payback Period = CAC / (ARPU × Gross Margin)

Example:
- CAC: 100 CHF
- ARPU: 150 CHF
- Gross Margin: 95%
- Payback = 100 / (150 × 0.95) = 0.7 months
```

### Payback by Acquisition Channel

| Channel | CAC | Monthly Profit | Payback |
|---------|-----|----------------|---------|
| Organic | 0 CHF | 142 CHF | Instant |
| Content | 50 CHF | 142 CHF | <1 month |
| Paid Ads | 200 CHF | 142 CHF | 1.4 months |
| Enterprise Sales | 500 CHF | 217 CHF | 2.3 months |

---

## 📊 LTV:CAC Ratio

### Interpretation

| Ratio | Meaning | Action |
|-------|---------|--------|
| <1:1 | Losing money | ❌ Unsustainable |
| 1:1 - 3:1 | Breaking even | ⚠️ Improve efficiency |
| 3:1 - 5:1 | Healthy | ✅ Standard SaaS |
| >5:1 | Excellent | 🚀 Invest more in growth |
| >15:1 | Exceptional | 💎 Strong product-market fit |

### DealerOS Target

```
Target LTV:CAC = 15:1+

With:
- LTV: 4,000 CHF (conservative)
- CAC: 100-200 CHF (organic-heavy)
= LTV:CAC: 20:1 to 40:1
```

---

## 💵 Gross Margin Analysis

### Cost Structure per Customer

| Cost Item | Monthly | % of Revenue |
|-----------|---------|--------------|
| Stripe Fees | ~4 CHF | 3.1% |
| Supabase (allocated) | ~0.25 CHF | 0.2% |
| Vercel (allocated) | ~0.25 CHF | 0.2% |
| Email (Resend) | ~0.05 CHF | <0.1% |
| **Total COGS** | ~4.55 CHF | ~3.5% |
| **Gross Profit** | ~124.45 CHF | **~96.5%** |

### Gross Margin by Plan

| Plan | Revenue | COGS | Gross Profit | Margin |
|------|---------|------|--------------|--------|
| Professional | 129 CHF | 4.55 CHF | 124.45 CHF | 96.5% |
| Business | 229 CHF | 7.15 CHF | 221.85 CHF | 96.9% |

---

## 📉 Sensitivity Analysis

### LTV Sensitivity to Churn

| Monthly Churn | Lifetime (months) | LTV (Prof.) | LTV (Bus.) |
|---------------|-------------------|-------------|------------|
| 1% | 100 | 12,255 CHF | 21,785 CHF |
| 2% | 50 | 6,128 CHF | 10,893 CHF |
| 3% | 33 | 4,044 CHF | 7,186 CHF |
| 5% | 20 | 2,451 CHF | 4,357 CHF |
| 10% | 10 | 1,226 CHF | 2,179 CHF |

### CAC Sensitivity to LTV:CAC

| Target LTV:CAC | LTV = 4,000 | Max CAC |
|----------------|-------------|---------|
| 20:1 | 4,000 CHF | 200 CHF |
| 15:1 | 4,000 CHF | 267 CHF |
| 10:1 | 4,000 CHF | 400 CHF |
| 5:1 | 4,000 CHF | 800 CHF |

---

## 🎯 Improvement Levers

### Increase LTV
1. **Reduce Churn:** Better onboarding, customer success
2. **Increase ARPU:** Upsells, add-ons, price optimization
3. **Expand Revenue:** Seat-based pricing, usage fees

### Decrease CAC
1. **Organic Growth:** SEO, content, word-of-mouth
2. **Conversion Optimization:** Landing page, onboarding
3. **Referral Program:** Customer-driven acquisition

---

*Template - fill in actual metrics before sharing*
