#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Hanzo Identity - Complete Test Suite        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""

# Kill any existing processes
echo -e "${BLUE}Cleaning up existing processes...${NC}"
pkill -9 -f anvil 2>/dev/null || true
pkill -9 -f "node server" 2>/dev/null || true
sleep 2

# Start anvil in background
echo -e "${BLUE}Starting Anvil...${NC}"
anvil --port 8545 --chain-id 31337 > /tmp/anvil.log 2>&1 &
ANVIL_PID=$!
echo "Anvil PID: $ANVIL_PID"
sleep 3

# Deploy contracts
echo -e "${BLUE}Deploying contracts...${NC}"
node deploy.js
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Contract deployment failed${NC}"
    kill $ANVIL_PID
    exit 1
fi
echo -e "${GREEN}✓ Contracts deployed${NC}"
echo ""

# Run contract tests
echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Running Contract Tests (35 tests)           ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""
node test-all.js
CONTRACT_TEST_EXIT=$?

if [ $CONTRACT_TEST_EXIT -eq 0 ]; then
    echo -e "${GREEN}✓ All contract tests passed!${NC}"
else
    echo -e "${RED}✗ Some contract tests failed${NC}"
fi
echo ""

# Run Playwright e2e tests (Playwright will handle starting the server)
echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Running E2E Tests (Playwright)              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""
npx playwright test --project=chromium --reporter=list
E2E_TEST_EXIT=$?

if [ $E2E_TEST_EXIT -eq 0 ]; then
    echo -e "${GREEN}✓ All e2e tests passed!${NC}"
else
    echo -e "${RED}✗ Some e2e tests failed${NC}"
fi
echo ""

# Cleanup
echo -e "${BLUE}Cleaning up...${NC}"
kill $ANVIL_PID 2>/dev/null || true

# Summary
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Test Summary                                  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""

if [ $CONTRACT_TEST_EXIT -eq 0 ]; then
    echo -e "Contract Tests: ${GREEN}✓ PASSED${NC}"
else
    echo -e "Contract Tests: ${RED}✗ FAILED${NC}"
fi

if [ $E2E_TEST_EXIT -eq 0 ]; then
    echo -e "E2E Tests:      ${GREEN}✓ PASSED${NC}"
else
    echo -e "E2E Tests:      ${RED}✗ FAILED${NC}"
fi

echo ""

if [ $CONTRACT_TEST_EXIT -eq 0 ] && [ $E2E_TEST_EXIT -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  🎉 ALL TESTS PASSED! 🎉                      ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}"
    exit 0
else
    echo -e "${RED}╔════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  ⚠️  SOME TESTS FAILED ⚠️                     ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════╝${NC}"
    exit 1
fi
