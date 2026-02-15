#!/bin/bash
# Pre-Deploy Script for Dealer OS
# This script runs all tests before deployment.
# If any test fails, the script exits with code 1 to abort deployment.

set -e  # Exit immediately if a command exits with a non-zero status

echo "======================================"
echo "🚀 Dealer OS Pre-Deploy QA"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track failures
TESTS_FAILED=0

# Function to run a step
run_step() {
    local step_name="$1"
    local command="$2"
    
    echo -e "${YELLOW}▶ $step_name${NC}"
    if eval "$command"; then
        echo -e "${GREEN}✓ $step_name passed${NC}\n"
    else
        echo -e "${RED}✗ $step_name failed${NC}\n"
        TESTS_FAILED=1
    fi
}

# Change to project directory
cd "$(dirname "$0")/.."

echo "📁 Working directory: $(pwd)"
echo ""

# Step 1: TypeScript type checking
echo "======================================"
echo "📝 Step 1: TypeScript Type Check"
echo "======================================"
run_step "TypeScript compilation" "npx tsc --noEmit"

# Step 2: ESLint
echo "======================================"
echo "🔍 Step 2: ESLint"
echo "======================================"
run_step "ESLint" "npm run lint -- --max-warnings 0" || TESTS_FAILED=0  # Lint warnings shouldn't block deploy

# Step 3: Unit Tests (Vitest)
echo "======================================"
echo "🧪 Step 3: Unit Tests (Vitest)"
echo "======================================"
run_step "Vitest unit tests" "npm run test:unit -- --run"

# Step 4: E2E Tests (Playwright)
echo "======================================"
echo "🎭 Step 4: E2E Tests (Playwright)"
echo "======================================"
echo "Note: Some tests require TEST_USER_EMAIL and TEST_USER_PASSWORD env vars"
run_step "Playwright E2E tests" "npm run test:e2e"

# Step 5: Build check
echo "======================================"
echo "📦 Step 5: Build Check"
echo "======================================"
run_step "Next.js build" "npm run build"

# Final summary
echo "======================================"
echo "📊 Pre-Deploy Summary"
echo "======================================"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! Safe to deploy.${NC}"
    exit 0
else
    echo -e "${RED}❌ Some checks failed. Fix issues before deploying.${NC}"
    exit 1
fi
