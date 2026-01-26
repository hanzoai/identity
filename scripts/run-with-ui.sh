#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Hanzo Identity dApp - Full Stack${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Clean up any existing processes
echo -e "${BLUE}1. Cleaning up existing processes...${NC}"
pkill -9 -f anvil 2>/dev/null
pkill -9 -f "node server.js" 2>/dev/null
sleep 2

# Start Anvil
echo -e "${BLUE}2. Starting Anvil blockchain...${NC}"
anvil --port 8545 --chain-id 31337 > /tmp/anvil.log 2>&1 &
ANVIL_PID=$!
echo -e "${GREEN}   ✓ Anvil started (PID: $ANVIL_PID)${NC}"
sleep 3

# Deploy contracts
echo -e "${BLUE}3. Deploying contracts...${NC}"
node deploy.js
if [ $? -eq 0 ]; then
    echo -e "${GREEN}   ✓ Contracts deployed${NC}"
else
    echo -e "${RED}   ✗ Contract deployment failed${NC}"
    kill $ANVIL_PID
    exit 1
fi

# Register test identities
echo -e "${BLUE}4. Registering test identities...${NC}"
node register-test-identities.js
echo -e "${GREEN}   ✓ Test identities registered${NC}"

# Start web server
echo -e "${BLUE}5. Starting web server...${NC}"
node server.js > /tmp/server.log 2>&1 &
SERVER_PID=$!
echo -e "${GREEN}   ✓ Server started (PID: $SERVER_PID)${NC}"
sleep 2

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  ✅ All systems running!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Anvil:      http://localhost:8545 (PID: $ANVIL_PID)"
echo -e "Web UI:     http://localhost:3000 (PID: $SERVER_PID)"
echo ""
echo -e "Press Ctrl+C to stop all services"
echo ""

# Wait for Ctrl+C
trap "echo ''; echo 'Stopping services...'; kill $ANVIL_PID $SERVER_PID 2>/dev/null; exit 0" INT
wait
