# Financial Projections

> 3-year revenue and expense forecasts

---

## 📊 Projection Scenarios

### Assumptions Overview

| Assumption | Conservative | Base | Optimistic |
|------------|--------------|------|------------|
| Monthly Customer Growth | 5% | 10% | 15% |
| Monthly Churn | 4% | 3% | 2% |
| Free → Paid Conversion | 5% | 10% | 15% |
| Average Plan Mix (Prof:Bus) | 70:30 | 60:40 | 50:50 |
| Price Increase (Y2) | 0% | 5% | 10% |

---

## 📈 Revenue Projections

### Year 1 (2025)

| Month | New | Churned | Total | MRR (CHF) |
|-------|-----|---------|-------|-----------|
| Jan | 5 | 0 | 5 | 750 |
| Feb | 5 | 0 | 10 | 1,500 |
| Mar | 6 | 0 | 16 | 2,400 |
| Apr | 6 | 1 | 21 | 3,150 |
| May | 7 | 1 | 27 | 4,050 |
| Jun | 8 | 1 | 34 | 5,100 |
| Jul | 8 | 1 | 41 | 6,150 |
| Aug | 9 | 1 | 49 | 7,350 |
| Sep | 10 | 2 | 57 | 8,550 |
| Oct | 11 | 2 | 66 | 9,900 |
| Nov | 12 | 2 | 76 | 11,400 |
| Dec | 13 | 2 | 87 | 13,050 |
| **EOY** | **100** | **13** | **87** | **13,050** |

**Year 1 ARR (Conservative):** ~156,000 CHF

### Year 2 (2026)

| Quarter | Start | New | Churned | End | MRR (CHF) |
|---------|-------|-----|---------|-----|-----------|
| Q1 | 87 | 45 | 8 | 124 | 18,600 |
| Q2 | 124 | 55 | 10 | 169 | 25,350 |
| Q3 | 169 | 65 | 12 | 222 | 33,300 |
| Q4 | 222 | 80 | 15 | 287 | 43,050 |
| **EOY** | - | **245** | **45** | **287** | **43,050** |

**Year 2 ARR (Base):** ~516,000 CHF

### Year 3 (2027)

| Quarter | Start | New | Churned | End | MRR (CHF) |
|---------|-------|-----|---------|-----|-----------|
| Q1 | 287 | 100 | 20 | 367 | 55,050 |
| Q2 | 367 | 120 | 25 | 462 | 69,300 |
| Q3 | 462 | 140 | 30 | 572 | 85,800 |
| Q4 | 572 | 160 | 35 | 697 | 104,550 |
| **EOY** | - | **520** | **110** | **697** | **104,550** |

**Year 3 ARR (Base):** ~1,255,000 CHF

---

## 💰 Three Scenarios Summary

### Annual Recurring Revenue (ARR)

| Year | Conservative | Base | Optimistic |
|------|--------------|------|------------|
| 2025 | 120,000 CHF | 156,000 CHF | 240,000 CHF |
| 2026 | 360,000 CHF | 516,000 CHF | 840,000 CHF |
| 2027 | 720,000 CHF | 1,255,000 CHF | 2,160,000 CHF |

### Paying Customers

| Year | Conservative | Base | Optimistic |
|------|--------------|------|------------|
| 2025 | 65 | 87 | 130 |
| 2026 | 200 | 287 | 450 |
| 2027 | 400 | 697 | 1,200 |

---

## 📉 Expense Projections

### Fixed Costs (Monthly)

| Item | Y1 | Y2 | Y3 |
|------|----|----|-----|
| Infrastructure (Vercel/Supabase) | 70 | 150 | 500 |
| Domain/SSL | 5 | 5 | 5 |
| Tools/Software | 50 | 100 | 200 |
| **Total Fixed** | **125** | **255** | **705** |

### Variable Costs (as % of Revenue)

| Item | Rate |
|------|------|
| Stripe Fees | 3.1% |
| Email (Resend) | 0.1% |
| Infrastructure Scale | 0.3% |
| **Total Variable** | **~3.5%** |

### Operating Expenses (Optional Growth)

| Item | Y1 | Y2 | Y3 |
|------|----|----|-----|
| Marketing | 0 | 12,000 | 36,000 |
| Part-time Support | 0 | 0 | 24,000 |
| Contractor Dev | 0 | 0 | 48,000 |
| **Total OpEx** | **0** | **12,000** | **108,000** |

---

## 📊 Profitability Analysis (Base Case)

### Year-by-Year P&L

| Item | 2025 | 2026 | 2027 |
|------|------|------|------|
| **Revenue** | 120,000 | 380,000 | 950,000 |
| Stripe Fees (3.1%) | (3,720) | (11,780) | (29,450) |
| Infrastructure | (1,500) | (3,060) | (8,460) |
| Email/Misc | (300) | (600) | (1,200) |
| **Gross Profit** | **114,480** | **364,560** | **910,890** |
| **Gross Margin** | **95.4%** | **95.9%** | **95.9%** |
| Marketing | 0 | (12,000) | (36,000) |
| Support | 0 | 0 | (24,000) |
| Development | 0 | 0 | (48,000) |
| **Operating Profit** | **114,480** | **352,560** | **802,890** |
| **Operating Margin** | **95.4%** | **92.8%** | **84.5%** |

---

## 🎯 Break-Even Analysis

### Current Cost Structure

```
Monthly Fixed Costs: ~125 CHF
Variable Costs: ~3.5% of revenue
Average ARPU: ~150 CHF/month

Break-even Customers = Fixed Costs / (ARPU × Gross Margin)
                     = 125 / (150 × 0.965)
                     = 0.9 customers

→ Break-even at 1 paying customer
```

### With Growth Investment

```
If adding:
- Marketing: 1,000 CHF/month
- Support: 2,000 CHF/month (part-time)
- Total Monthly: 3,125 CHF

Break-even = 3,125 / (150 × 0.965) = 22 customers
```

---

## 📈 Key Metrics Trajectory

### Monthly Recurring Revenue Growth

```
        Year 1          Year 2          Year 3
MRR:    750 → 13,050    13,050 → 43,050    43,050 → 104,550
Growth: ~17x            ~3.3x              ~2.4x
```

### Unit Economics Evolution

| Metric | Y1 | Y2 | Y3 |
|--------|----|----|-----|
| ARPU | 150 CHF | 155 CHF | 160 CHF |
| Churn | 3.5% | 3.0% | 2.5% |
| LTV | 3,900 CHF | 4,650 CHF | 5,700 CHF |
| CAC | 100 CHF | 120 CHF | 150 CHF |
| LTV:CAC | 39:1 | 39:1 | 38:1 |

---

## ⚠️ Risks & Sensitivities

### Key Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Slower adoption | Lower revenue | Focus on product-market fit |
| Higher churn | Lower LTV | Improve onboarding/support |
| Competition | Price pressure | Differentiation, features |
| Market saturation | Growth ceiling | DACH expansion |

### Scenario Ranges

| Outcome | Probability | 2027 ARR |
|---------|-------------|----------|
| Downside | 20% | 500,000 CHF |
| Base | 60% | 1,200,000 CHF |
| Upside | 20% | 2,500,000 CHF |

---

*Projections are estimates - actual results may vary*
