#!/bin/bash

###############################################################################
# CI/CD Setup Script
#
# Automatically sets up GitHub Actions CI/CD workflows
#
# Usage:
#   bash scripts/setup-ci.sh
#   
# Or make it executable and run directly:
#   chmod +x scripts/setup-ci.sh
#   ./scripts/setup-ci.sh
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
WORKFLOWS_DIR="$PROJECT_ROOT/.github/workflows"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║          CI/CD Workflow Setup - First Responder           ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if workflows directory exists
if [ ! -d "$WORKFLOWS_DIR" ]; then
    echo -e "${RED}❌ Error: .github/workflows directory not found${NC}"
    exit 1
fi

echo -e "${CYAN}📋 Current Workflows:${NC}"
ls -1 "$WORKFLOWS_DIR" | sed 's/^/   /'
echo ""

echo -e "${YELLOW}🎯 This script will help you set up CI workflows${NC}"
echo ""
echo -e "${CYAN}Available workflows to add:${NC}"
echo -e "   ${GREEN}1.${NC} app-ci.yml - Main CI pipeline (build, test, lint)"
echo -e "   ${GREEN}2.${NC} code-quality.yml - Security scanning"
echo -e "   ${GREEN}3.${NC} pr-checks.yml - PR validation"
echo -e "   ${GREEN}4.${NC} release.yml - Release automation"
echo ""

read -p "$(echo -e ${YELLOW}Which option? [1=Main CI, 2=All workflows, 3=Cancel]: ${NC})" -n 1 -r
echo ""

case $REPLY in
    1)
        echo -e "${GREEN}📝 Creating main CI workflow...${NC}"
        WORKFLOWS_TO_CREATE=("app-ci.yml")
        ;;
    2)
        echo -e "${GREEN}📝 Creating all CI workflows...${NC}"
        WORKFLOWS_TO_CREATE=("app-ci.yml" "code-quality.yml" "pr-checks.yml" "release.yml")
        ;;
    3)
        echo -e "${YELLOW}Cancelled.${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}Invalid option. Exiting.${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${CYAN}📖 Workflow files are documented in:${NC}"
echo -e "   ${GREEN}docs/CI_CD_COMPLETE_GUIDE.md${NC}"
echo ""
echo -e "${YELLOW}⚠️  You'll need to manually copy the workflow content from the docs${NC}"
echo -e "${YELLOW}   This script will create the files and show you what to do next${NC}"
echo ""

for workflow in "${WORKFLOWS_TO_CREATE[@]}"; do
    WORKFLOW_PATH="$WORKFLOWS_DIR/$workflow"
    
    if [ -f "$WORKFLOW_PATH" ]; then
        echo -e "${YELLOW}⚠️  $workflow already exists, skipping...${NC}"
    else
        echo -e "${GREEN}✅ Creating $workflow${NC}"
        
        # Create placeholder file
        cat > "$WORKFLOW_PATH" << 'EOF'
# TODO: Copy workflow content from docs/CI_CD_COMPLETE_GUIDE.md
# Search for the workflow name in the guide and copy the complete YAML content

name: Placeholder - Replace with actual workflow

on:
  push:
    branches: [main]

jobs:
  placeholder:
    runs-on: ubuntu-latest
    steps:
      - name: Placeholder
        run: echo "Replace this workflow with content from CI_CD_COMPLETE_GUIDE.md"
EOF
        
        echo -e "   ${CYAN}→ Created placeholder at: $WORKFLOW_PATH${NC}"
    fi
done

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Workflow files created!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${CYAN}📝 Next Steps:${NC}"
echo ""
echo -e "${YELLOW}1. Open the CI/CD Complete Guide:${NC}"
echo -e "   ${GREEN}cat docs/CI_CD_COMPLETE_GUIDE.md | less${NC}"
echo -e "   ${GREEN}# Or open in your editor${NC}"
echo ""

echo -e "${YELLOW}2. For each workflow file created, copy the content:${NC}"
for workflow in "${WORKFLOWS_TO_CREATE[@]}"; do
    echo -e "   ${CYAN}→ $workflow${NC}"
    echo -e "     ${GREEN}Search for '$workflow' in CI_CD_COMPLETE_GUIDE.md${NC}"
    echo -e "     ${GREEN}Copy the complete YAML content${NC}"
    echo -e "     ${GREEN}Replace the placeholder in .github/workflows/$workflow${NC}"
    echo ""
done

echo -e "${YELLOW}3. Verify GitHub Secrets are set:${NC}"
echo -e "   ${GREEN}Go to: GitHub → Settings → Secrets → Actions${NC}"
echo -e "   ${CYAN}Required:${NC}"
echo -e "     - VITE_SUPABASE_URL"
echo -e "     - VITE_SUPABASE_ANON_KEY"
echo -e "     - VERCEL_TOKEN"
echo -e "     - VERCEL_ORG_ID"
echo -e "     - VERCEL_PROJECT_ID"
echo ""

echo -e "${YELLOW}4. Commit and push:${NC}"
echo -e "   ${GREEN}git add .github/workflows/${NC}"
echo -e "   ${GREEN}git commit -m \"ci: add CI/CD workflows\"${NC}"
echo -e "   ${GREEN}git push origin main${NC}"
echo ""

echo -e "${YELLOW}5. Verify workflows run:${NC}"
echo -e "   ${GREEN}gh run watch${NC}"
echo -e "   ${GREEN}# Or check GitHub → Actions tab${NC}"
echo ""

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}📚 Documentation:${NC}"
echo -e "   ${GREEN}Quick Start:${NC}    docs/CI_CD_QUICK_START.md"
echo -e "   ${GREEN}Complete Guide:${NC} docs/CI_CD_COMPLETE_GUIDE.md"
echo -e "   ${GREEN}Visual Overview:${NC} docs/CI_CD_VISUAL_OVERVIEW.md"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${GREEN}🎉 Setup complete! Follow the next steps above.${NC}"
echo ""
