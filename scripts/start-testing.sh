#!/bin/bash

###############################################################################
# Start Testing Session
#
# This script sets up the testing environment and opens the necessary files
# for manual testing and bug logging.
#
# Usage:
#   bash scripts/start-testing.sh
#   
# Or make it executable and run directly:
#   chmod +x scripts/start-testing.sh
#   ./scripts/start-testing.sh
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     First Responder Connect - Testing Session Setup       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if dev server is already running
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${GREEN}✅ Dev server already running on port 8080${NC}"
else
    echo -e "${YELLOW}🚀 Starting development server...${NC}"
    cd "$PROJECT_ROOT"
    npm run dev > /dev/null 2>&1 &
    DEV_PID=$!
    echo -e "${GREEN}✅ Dev server started (PID: $DEV_PID)${NC}"
    echo -e "${CYAN}   Waiting for server to be ready...${NC}"
    sleep 3
fi

echo ""
echo -e "${CYAN}📋 Testing Environment:${NC}"
echo -e "   ${GREEN}Local URL:${NC} http://localhost:8080"
echo -e "   ${GREEN}Network URL:${NC} http://$(ipconfig getifaddr en0 2>/dev/null || echo "N/A"):8080"
echo ""

echo -e "${CYAN}📝 Testing Files Created:${NC}"
echo -e "   ${GREEN}1.${NC} TESTING_BUGS.md - Log bugs here"
echo -e "   ${GREEN}2.${NC} TESTING_CHECKLIST.md - Feature checklist"
echo -e "   ${GREEN}3.${NC} TESTING_SESSION.md - Session notes"
echo ""

echo -e "${CYAN}🎯 Quick Commands:${NC}"
echo -e "   ${GREEN}Open app:${NC}        open http://localhost:8080"
echo -e "   ${GREEN}View bugs:${NC}       cat TESTING_BUGS.md"
echo -e "   ${GREEN}View checklist:${NC}  cat TESTING_CHECKLIST.md"
echo -e "   ${GREEN}Stop server:${NC}     pkill -f 'vite'"
echo ""

# Ask if user wants to open browser
read -p "$(echo -e ${YELLOW}Open browser now? [y/N]: ${NC})" -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${GREEN}🌐 Opening browser...${NC}"
    open http://localhost:8080 2>/dev/null || xdg-open http://localhost:8080 2>/dev/null || echo "Please open http://localhost:8080 manually"
fi

echo ""
echo -e "${GREEN}✅ Testing environment ready!${NC}"
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}Happy Testing! 🧪${NC}"
echo -e "${YELLOW}Remember to log all bugs in TESTING_BUGS.md${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
