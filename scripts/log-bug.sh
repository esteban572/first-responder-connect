#!/bin/bash

###############################################################################
# Quick Bug Logger
#
# Interactive script to quickly log bugs during testing
#
# Usage:
#   bash scripts/log-bug.sh
#   ./scripts/log-bug.sh
###############################################################################

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BUG_FILE="$PROJECT_ROOT/TESTING_BUGS.md"

echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${RED}║                    Quick Bug Logger                        ║${NC}"
echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Get bug number
CURRENT_BUGS=$(grep -c "^### Bug #" "$BUG_FILE" 2>/dev/null || echo "0")
BUG_NUMBER=$((CURRENT_BUGS + 1))

echo -e "${CYAN}Bug #${BUG_NUMBER}${NC}"
echo ""

# Get bug title
echo -e "${YELLOW}Enter bug title (short description):${NC}"
read -r BUG_TITLE

# Get severity
echo ""
echo -e "${YELLOW}Select severity:${NC}"
echo "  1) Critical"
echo "  2) High"
echo "  3) Medium"
echo "  4) Low"
read -p "Enter number [1-4]: " SEVERITY_NUM

case $SEVERITY_NUM in
    1) SEVERITY="Critical" ;;
    2) SEVERITY="High" ;;
    3) SEVERITY="Medium" ;;
    4) SEVERITY="Low" ;;
    *) SEVERITY="Medium" ;;
esac

# Get workflow
echo ""
echo -e "${YELLOW}Which workflow/feature?${NC}"
read -r WORKFLOW

# Get steps to reproduce
echo ""
echo -e "${YELLOW}Steps to reproduce (enter 'done' when finished):${NC}"
STEPS=""
STEP_NUM=1
while true; do
    read -p "Step $STEP_NUM: " STEP
    if [ "$STEP" = "done" ]; then
        break
    fi
    STEPS="${STEPS}  ${STEP_NUM}. ${STEP}\n"
    STEP_NUM=$((STEP_NUM + 1))
done

# Get expected behavior
echo ""
echo -e "${YELLOW}Expected behavior:${NC}"
read -r EXPECTED

# Get actual behavior
echo ""
echo -e "${YELLOW}Actual behavior:${NC}"
read -r ACTUAL

# Get console errors
echo ""
echo -e "${YELLOW}Any console errors? (leave empty if none):${NC}"
read -r CONSOLE_ERRORS

# Current date
CURRENT_DATE=$(date +%Y-%m-%d)

# Create bug entry
BUG_ENTRY="
### Bug #${BUG_NUMBER}: ${BUG_TITLE}
- **Severity:** ${SEVERITY}
- **Workflow:** ${WORKFLOW}
- **Steps to Reproduce:**
${STEPS}- **Expected Behavior:** ${EXPECTED}
- **Actual Behavior:** ${ACTUAL}"

if [ -n "$CONSOLE_ERRORS" ]; then
    BUG_ENTRY="${BUG_ENTRY}
- **Console Errors:** ${CONSOLE_ERRORS}"
fi

BUG_ENTRY="${BUG_ENTRY}
- **Status:** Open
- **Found:** ${CURRENT_DATE}

---
"

# Append to bug file
# Find the line with "## 📝 Bugs Log" and insert after the next line
if grep -q "## 📝 Bugs Log" "$BUG_FILE"; then
    # Create temp file with bug entry inserted
    awk -v bug="$BUG_ENTRY" '
        /## 📝 Bugs Log/ { print; getline; print; print bug; next }
        { print }
    ' "$BUG_FILE" > "${BUG_FILE}.tmp"
    mv "${BUG_FILE}.tmp" "$BUG_FILE"
else
    echo "$BUG_ENTRY" >> "$BUG_FILE"
fi

# Update bug count
TOTAL_BUGS=$(grep -c "^### Bug #" "$BUG_FILE")
CRITICAL=$(grep -c "Severity:** Critical" "$BUG_FILE")
HIGH=$(grep -c "Severity:** High" "$BUG_FILE")
MEDIUM=$(grep -c "Severity:** Medium" "$BUG_FILE")
LOW=$(grep -c "Severity:** Low" "$BUG_FILE")
OPEN=$(grep -c "Status:** Open" "$BUG_FILE")

# Update summary section
sed -i.bak "s/\*\*Total Bugs Found:\*\* [0-9]*/\*\*Total Bugs Found:\*\* $TOTAL_BUGS/" "$BUG_FILE"
sed -i.bak "s/\*\*Critical:\*\* [0-9]*/\*\*Critical:\*\* $CRITICAL/" "$BUG_FILE"
sed -i.bak "s/\*\*High:\*\* [0-9]*/\*\*High:\*\* $HIGH/" "$BUG_FILE"
sed -i.bak "s/\*\*Medium:\*\* [0-9]*/\*\*Medium:\*\* $MEDIUM/" "$BUG_FILE"
sed -i.bak "s/\*\*Low:\*\* [0-9]*/\*\*Low:\*\* $LOW/" "$BUG_FILE"
sed -i.bak "s/\*\*Open:\*\* [0-9]*/\*\*Open:\*\* $OPEN/" "$BUG_FILE"
rm "${BUG_FILE}.bak"

echo ""
echo -e "${GREEN}✅ Bug #${BUG_NUMBER} logged successfully!${NC}"
echo ""
echo -e "${CYAN}Summary:${NC}"
echo -e "  Title: ${BUG_TITLE}"
echo -e "  Severity: ${SEVERITY}"
echo -e "  Workflow: ${WORKFLOW}"
echo ""
echo -e "${YELLOW}View all bugs: cat TESTING_BUGS.md${NC}"
echo ""
