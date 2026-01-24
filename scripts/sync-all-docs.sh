#!/bin/bash

###############################################################################
# Sync All Documentation to Notion
#
# This script provides a convenient way to sync all documentation files
# to your Notion workspace.
#
# Usage:
#   bash scripts/sync-all-docs.sh
#   
# Or make it executable and run directly:
#   chmod +x scripts/sync-all-docs.sh
#   ./scripts/sync-all-docs.sh
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Notion Documentation Sync - First Responder Connect      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if .env.notion exists
if [ ! -f "$PROJECT_ROOT/.env.notion" ]; then
    echo -e "${RED}❌ Error: .env.notion file not found!${NC}"
    echo -e "${YELLOW}💡 Create .env.notion with your NOTION_API_KEY${NC}"
    exit 1
fi

# Check if notion-page-mapping.json exists
if [ ! -f "$SCRIPT_DIR/notion-page-mapping.json" ]; then
    echo -e "${YELLOW}⚠️  Workspace structure not found. Creating it now...${NC}"
    echo ""
    node "$SCRIPT_DIR/create-notion-workspace.js"
    echo ""
fi

# Run the sync
echo -e "${GREEN}🚀 Starting full documentation sync...${NC}"
echo ""

node "$SCRIPT_DIR/sync-to-notion.js"

echo ""
echo -e "${GREEN}✅ All done!${NC}"
echo ""
echo -e "${BLUE}📖 View your documentation in Notion:${NC}"
echo -e "   https://www.notion.so/First-Responder-Connectwha-2f1717e8cf8481738d3febbde3c057bd"
echo ""
