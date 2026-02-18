#!/usr/bin/env node
/**
 * E2E Test Coverage Checker
 * 
 * Analyzes which dashboard pages have E2E tests and which don't.
 * Used by CI/cron to detect when new features need test coverage.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

// Dashboard pages that should have E2E tests
const DASHBOARD_MODULES = [
  { name: 'vehicles', path: 'dashboard/vehicles', testFile: 'vehicles.spec.ts' },
  { name: 'leads', path: 'dashboard/leads', testFile: 'leads.spec.ts' },
  { name: 'customers', path: 'dashboard/customers', testFile: 'customers.spec.ts' },
  { name: 'quotes', path: 'dashboard/quotes', testFile: 'quotes.spec.ts' },
  { name: 'invoices', path: 'dashboard/invoices', testFile: 'invoices.spec.ts' },
  { name: 'settings', path: 'dashboard/settings', testFile: 'settings.spec.ts' },
  { name: 'whatsapp', path: 'dashboard/whatsapp', testFile: 'whatsapp.spec.ts' },
];

// Landing/public pages
const PUBLIC_PAGES = [
  { name: 'landing', path: '', testFile: 'landing.spec.ts' },
  { name: 'login', path: 'login', testFile: 'auth.spec.ts' },
  { name: 'register', path: 'register', testFile: 'auth.spec.ts' },
  { name: 'onboarding', path: 'onboarding', testFile: 'onboarding.spec.ts' },
];

function checkPageExists(pagePath) {
  const fullPath = path.join(rootDir, 'src/app/[locale]', pagePath, 'page.tsx');
  return fs.existsSync(fullPath);
}

function checkTestExists(testFile) {
  const fullPath = path.join(rootDir, 'e2e', testFile);
  return fs.existsSync(fullPath);
}

function getTestLineCount(testFile) {
  const fullPath = path.join(rootDir, 'e2e', testFile);
  if (!fs.existsSync(fullPath)) return 0;
  const content = fs.readFileSync(fullPath, 'utf-8');
  return content.split('\n').length;
}

function countTestCases(testFile) {
  const fullPath = path.join(rootDir, 'e2e', testFile);
  if (!fs.existsSync(fullPath)) return 0;
  const content = fs.readFileSync(fullPath, 'utf-8');
  // Count test() calls
  const matches = content.match(/test\s*\(/g);
  return matches ? matches.length : 0;
}

function discoverDashboardPages() {
  const dashboardDir = path.join(rootDir, 'src/app/[locale]/dashboard');
  if (!fs.existsSync(dashboardDir)) return [];
  
  const discovered = [];
  const entries = fs.readdirSync(dashboardDir, { withFileTypes: true });
  
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const pagePath = path.join(dashboardDir, entry.name, 'page.tsx');
      if (fs.existsSync(pagePath)) {
        discovered.push({
          name: entry.name,
          path: `dashboard/${entry.name}`,
          testFile: `${entry.name}.spec.ts`,
        });
      }
    }
  }
  
  return discovered;
}

function main() {
  console.log('🧪 E2E Test Coverage Report\n');
  console.log('=' .repeat(60));
  
  // Discover all dashboard pages
  const discoveredPages = discoverDashboardPages();
  
  // Merge with known modules (in case naming differs)
  const allModules = [...DASHBOARD_MODULES];
  for (const page of discoveredPages) {
    if (!allModules.find(m => m.name === page.name)) {
      allModules.push(page);
    }
  }
  
  const missing = [];
  const covered = [];
  const partial = [];
  
  console.log('\n📊 Dashboard Modules:\n');
  
  for (const module of allModules) {
    const pageExists = checkPageExists(module.path);
    const testExists = checkTestExists(module.testFile);
    const testCount = countTestCases(module.testFile);
    
    if (!pageExists) {
      // Page doesn't exist, skip
      continue;
    }
    
    const status = testExists ? (testCount >= 5 ? '✅' : '⚠️') : '❌';
    const testInfo = testExists ? `${testCount} tests` : 'NO TESTS';
    
    console.log(`  ${status} ${module.name.padEnd(15)} ${testInfo}`);
    
    if (!testExists) {
      missing.push(module);
    } else if (testCount < 5) {
      partial.push({ ...module, testCount });
    } else {
      covered.push({ ...module, testCount });
    }
  }
  
  console.log('\n📊 Public Pages:\n');
  
  for (const page of PUBLIC_PAGES) {
    const testExists = checkTestExists(page.testFile);
    const testCount = countTestCases(page.testFile);
    const status = testExists ? '✅' : '❌';
    const testInfo = testExists ? `${testCount} tests` : 'NO TESTS';
    
    console.log(`  ${status} ${page.name.padEnd(15)} ${testInfo}`);
  }
  
  console.log('\n' + '=' .repeat(60));
  
  // Summary
  const totalModules = allModules.filter(m => checkPageExists(m.path)).length;
  const coveredCount = covered.length;
  const partialCount = partial.length;
  const missingCount = missing.length;
  
  console.log('\n📈 Summary:\n');
  console.log(`  Total dashboard modules: ${totalModules}`);
  console.log(`  ✅ Fully covered (5+ tests): ${coveredCount}`);
  console.log(`  ⚠️  Partially covered: ${partialCount}`);
  console.log(`  ❌ Missing tests: ${missingCount}`);
  
  const coveragePercent = Math.round((coveredCount / totalModules) * 100);
  console.log(`\n  Coverage: ${coveragePercent}%`);
  
  if (missing.length > 0) {
    console.log('\n🚨 Modules needing E2E tests:');
    for (const m of missing) {
      console.log(`  - ${m.name} (create e2e/${m.testFile})`);
    }
  }
  
  if (partial.length > 0) {
    console.log('\n⚠️  Modules with minimal tests (< 5):');
    for (const m of partial) {
      console.log(`  - ${m.name} (${m.testCount} tests in e2e/${m.testFile})`);
    }
  }
  
  // Output JSON for programmatic use
  const report = {
    timestamp: new Date().toISOString(),
    coverage: {
      total: totalModules,
      covered: coveredCount,
      partial: partialCount,
      missing: missingCount,
      percent: coveragePercent,
    },
    missingModules: missing.map(m => m.name),
    partialModules: partial.map(m => ({ name: m.name, testCount: m.testCount })),
  };
  
  // Write report to file
  const reportPath = path.join(rootDir, 'e2e-coverage-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Report saved to: e2e-coverage-report.json`);
  
  // Exit with error if coverage is below threshold or modules are missing
  if (missing.length > 0) {
    console.log('\n❌ FAIL: Some modules have no E2E tests!');
    process.exit(1);
  }
  
  if (coveragePercent < 80) {
    console.log('\n⚠️  WARNING: Coverage below 80%');
    process.exit(0); // Warning, not failure
  }
  
  console.log('\n✅ All modules have E2E test coverage!');
  process.exit(0);
}

main();
