# Notion Sync Scripts

Automated scripts to sync documentation from this repository to your Notion workspace.

## Setup Complete ✅

Your Notion integration is configured and ready to use!

- **Integration Name**: BlackBox CLI
- **Workspace**: Esteban Ibarra's Notion
- **API Key**: Stored in `.env.notion` (not committed to git)

## Available Scripts

### 1. Test Notion Connection
```bash
node scripts/test-notion-api.js
```
Tests your Notion API connection and lists all accessible pages.

### 2. Find Notion Pages
```bash
node scripts/find-notion-pages.js
```
Searches for pages in your Notion workspace to help you find page IDs.

### 3. Sync Documentation to Notion
```bash
node scripts/sync-to-notion.js
```
Syncs your markdown documentation files to Notion pages.

**Currently syncing:**
- `docs/IMPLEMENTATION_GUIDE.md` → First Responder Connect page

## Adding More Pages

To sync additional documentation files:

1. **Create a sub-page in Notion**:
   - Open your "First Responder Connect" page
   - Click "+ Add a page" to create a sub-page
   - Name it (e.g., "Quick Reference", "API Documentation")

2. **Share the page with BlackBox CLI integration**:
   - Click "..." → "Connections" → Select "BlackBox CLI"

3. **Get the page ID**:
   ```bash
   node scripts/find-notion-pages.js
   ```

4. **Update `scripts/sync-to-notion.js`**:
   ```javascript
   const PAGE_IDS = {
     'docs/IMPLEMENTATION_GUIDE.md': '2f1717e8-cf84-8173-8d3f-ebbde3c057bd',
     'docs/QUICK_REFERENCE.md': 'YOUR_NEW_PAGE_ID_HERE',
     'README.md': 'ANOTHER_PAGE_ID_HERE',
   };
   ```

5. **Run the sync**:
   ```bash
   node scripts/sync-to-notion.js
   ```

## Notion Page Structure

Your current Notion setup:

```
🚀 Project Pipeline (Database)
  └── First Responder Connect (Page)
      └── Implementation Guide (synced) ✅
```

**Recommended structure:**

```
🚀 Project Pipeline (Database)
  └── First Responder Connect (Page)
      ├── README (create this)
      ├── Implementation Guide ✅
      ├── Quick Reference (create this)
      ├── Deployment Guide (create this)
      └── API Documentation (create this)
```

## Troubleshooting

### No pages found
- Make sure you've shared the page with "BlackBox CLI" integration
- In Notion: Page → "..." → "Connections" → Add "BlackBox CLI"

### Sync errors
- Check that page IDs are correct
- Ensure the integration has access to the pages
- Run `node scripts/test-notion-api.js` to verify connection

### API key issues
- Verify `.env.notion` exists and contains your API key
- Get a new key at: https://www.notion.so/my-integrations

## Security

- `.env.notion` is in `.gitignore` and will NOT be committed
- Never share your Notion API key publicly
- The API key only has access to pages you explicitly share with the integration

## Links

- [Notion Integrations](https://www.notion.so/my-integrations)
- [Notion API Docs](https://developers.notion.com/)
- [First Responder Connect Page](https://www.notion.so/First-Responder-Connect-2f1717e8cf8481738d3febbde3c057bd)
