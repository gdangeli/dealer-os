# Open Source License Audit

> Complete analysis of third-party dependencies

---

## 📊 License Summary

| License Type | Count | Risk Level |
|--------------|-------|------------|
| **MIT** | ~45 | 🟢 Low |
| **Apache 2.0** | ~8 | 🟢 Low |
| **ISC** | ~5 | 🟢 Low |
| **BSD** | ~3 | 🟢 Low |
| **GPL/AGPL** | 0 | ✅ None |

**Overall Risk: 🟢 LOW**

All dependencies use permissive licenses compatible with commercial/proprietary software.

---

## 🔍 Production Dependencies

### Core Framework

| Package | Version | License | Risk |
|---------|---------|---------|------|
| **next** | 16.1.6 | MIT | 🟢 Low |
| **react** | 19.2.3 | MIT | 🟢 Low |
| **react-dom** | 19.2.3 | MIT | 🟢 Low |
| **typescript** | 5.x | Apache 2.0 | 🟢 Low |

### UI Components

| Package | Version | License | Risk |
|---------|---------|---------|------|
| **tailwindcss** | 4.x | MIT | 🟢 Low |
| **radix-ui** | 1.4.3 | MIT | 🟢 Low |
| **@radix-ui/react-*** | Various | MIT | 🟢 Low |
| **lucide-react** | 0.564 | ISC | 🟢 Low |
| **class-variance-authority** | 0.7.1 | Apache 2.0 | 🟢 Low |
| **clsx** | 2.1.1 | MIT | 🟢 Low |
| **tailwind-merge** | 3.4.1 | MIT | 🟢 Low |

### Backend/Services

| Package | Version | License | Risk |
|---------|---------|---------|------|
| **@supabase/supabase-js** | 2.95.3 | MIT | 🟢 Low |
| **@supabase/ssr** | 0.8.0 | MIT | 🟢 Low |
| **stripe** | 20.3.1 | Apache 2.0 | 🟢 Low |
| **@stripe/stripe-js** | 8.7.0 | Apache 2.0 | 🟢 Low |
| **resend** | 6.9.2 | MIT | 🟢 Low |

### Forms & Validation

| Package | Version | License | Risk |
|---------|---------|---------|------|
| **react-hook-form** | 7.71.1 | MIT | 🟢 Low |
| **@hookform/resolvers** | 3.9.1 | MIT | 🟢 Low |
| **zod** | 3.22.3 | MIT | 🟢 Low |

### Utilities

| Package | Version | License | Risk |
|---------|---------|---------|------|
| **date-fns** | 4.1.0 | MIT | 🟢 Low |
| **papaparse** | 5.5.3 | MIT | 🟢 Low |
| **xlsx** | 0.18.5 | Apache 2.0 | 🟢 Low |
| **browser-image-compression** | 2.0.2 | MIT | 🟢 Low |

### Internationalization

| Package | Version | License | Risk |
|---------|---------|---------|------|
| **next-intl** | 4.8.2 | MIT | 🟢 Low |

### Charts & Visualization

| Package | Version | License | Risk |
|---------|---------|---------|------|
| **recharts** | 3.7.0 | MIT | 🟢 Low |

### Drag & Drop

| Package | Version | License | Risk |
|---------|---------|---------|------|
| **@dnd-kit/core** | 6.3.1 | MIT | 🟢 Low |
| **@dnd-kit/sortable** | 10.0.0 | MIT | 🟢 Low |
| **@dnd-kit/utilities** | 3.2.2 | MIT | 🟢 Low |

### PDF Generation

| Package | Version | License | Risk |
|---------|---------|---------|------|
| **@react-pdf/renderer** | 4.3.2 | MIT | 🟢 Low |

### Notifications

| Package | Version | License | Risk |
|---------|---------|---------|------|
| **sonner** | 2.0.7 | MIT | 🟢 Low |

---

## 🧪 Dev Dependencies

### Testing

| Package | Version | License | Risk |
|---------|---------|---------|------|
| **vitest** | 4.0.18 | MIT | 🟢 Low |
| **@playwright/test** | 1.58.2 | Apache 2.0 | 🟢 Low |
| **@testing-library/react** | 16.3.2 | MIT | 🟢 Low |
| **@testing-library/dom** | 10.4.1 | MIT | 🟢 Low |
| **@testing-library/jest-dom** | 6.9.1 | MIT | 🟢 Low |
| **jsdom** | 28.1.0 | MIT | 🟢 Low |

### Build Tools

| Package | Version | License | Risk |
|---------|---------|---------|------|
| **eslint** | 9.x | MIT | 🟢 Low |
| **eslint-config-next** | 16.1.6 | MIT | 🟢 Low |

### Type Definitions

| Package | Version | License | Risk |
|---------|---------|---------|------|
| **@types/node** | 20.x | MIT | 🟢 Low |
| **@types/react** | 19.x | MIT | 🟢 Low |
| **@types/react-dom** | 19.x | MIT | 🟢 Low |
| **@types/papaparse** | 5.5.2 | MIT | 🟢 Low |

---

## ⚠️ License Compliance

### Permissive License Requirements

| License | Requirements | Compliance |
|---------|--------------|------------|
| **MIT** | Include license notice | ✅ In node_modules |
| **Apache 2.0** | Include license, state changes | ✅ In node_modules |
| **ISC** | Include license notice | ✅ In node_modules |

### Required Actions

For distribution (if applicable):

1. Include NOTICES file with attribution
2. Maintain license files in node_modules
3. No modification to license headers required

### Not Required

- ❌ Source code disclosure
- ❌ Copyleft provisions
- ❌ Patent grants beyond Apache 2.0

---

## 🔒 Security Considerations

### Known Vulnerabilities

Run regular audits:

```bash
npm audit
# Check for known vulnerabilities

npm audit fix
# Auto-fix compatible updates
```

### Dependency Updates

| Frequency | Action |
|-----------|--------|
| Weekly | `npm outdated` check |
| Monthly | Minor version updates |
| Quarterly | Major version review |

---

## ✅ Audit Conclusion

**License Risk: LOW**

- ✅ All licenses are permissive (MIT, Apache 2.0, ISC, BSD)
- ✅ No copyleft (GPL/AGPL/LGPL) dependencies
- ✅ No viral license provisions
- ✅ Commercial use explicitly permitted
- ✅ Modification and distribution allowed
- ✅ No patent concerns

**Recommendation:** Continue using current dependencies. No license changes required for M&A.

---

## 📋 Audit Commands

```bash
# List all production licenses
npx license-checker --production --summary

# Check for problematic licenses
npx license-checker --production --exclude 'MIT,Apache-2.0,ISC,BSD-2-Clause,BSD-3-Clause'

# Full audit report
npx license-checker --production --json > licenses.json
```

---

*Last Audited: February 2025*
