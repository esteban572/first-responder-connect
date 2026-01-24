#!/usr/bin/env node

/**
 * Create Notion Workspace Structure
 * 
 * This script automatically creates a hierarchical workspace structure
 * in Notion for the First Responder Connect project documentation.
 * 
 * Usage:
 *   node scripts/create-notion-workspace.js
 */

import https from 'https';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.notion') });

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_VERSION = '2022-06-28';

// Main page ID for First Responder Connect
const MAIN_PAGE_ID = '2f1717e8-cf84-8173-8d3f-ebbde3c057bd';

// Workspace structure to create
const WORKSPACE_STRUCTURE = {
  '📖 README & Overview': {
    icon: '📖',
    docs: ['README.md']
  },
  '📋 Setup & Configuration': {
    icon: '📋',
    docs: [
      'docs/SETUP_SUMMARY.md',
      'docs/QUICK_REFERENCE.md',
      'docs/GITHUB_SECRETS_SETUP.md'
    ]
  },
  '🏗️ Architecture & Design': {
    icon: '🏗️',
    docs: [
      'docs/ARCHITECTURE.md',
      'docs/PRD.md',
      'docs/API_DOCUMENTATION.md'
    ]
  },
  '🔄 Workflows & Processes': {
    icon: '🔄',
    docs: [
      'docs/WORKFLOWS.md',
      'docs/TECHNICAL_WORKFLOWS.md',
      'docs/ADMIN_ORGANIZATION_WORKFLOWS.md'
    ]
  },
  '🚀 CI/CD & Deployment': {
    icon: '🚀',
    docs: [
      'docs/CI_CD_SETUP.md',
      'docs/CI_CD_QUICK_START.md',
      'docs/CI_CD_COMPLETE_GUIDE.md',
      'docs/CI_CD_SETUP_SUMMARY.md',
      'docs/CI_CD_VISUAL_OVERVIEW.md',
      'docs/DEPLOYMENT_GUIDE.md'
    ]
  },
  '📚 Implementation': {
    icon: '📚',
    docs: [
      'docs/IMPLEMENTATION_GUIDE.md',
      'docs/ROADMAP.md',
      'docs/QA_STRATEGY.md'
    ]
  },
  '📝 Changelog': {
    icon: '📝',
    docs: ['CHANGELOG.md']
  }
};

// Notion API helper
function notionRequest(endpoint, method, data) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.notion.com',
      path: endpoint,
      method: method,
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(body));
        } else {
          reject(new Error(`Notion API error: ${res.statusCode} - ${body}`));
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

// Create a new page in Notion
async function createPage(parentId, title, icon = null) {
  console.log(`Creating page: ${title}`);
  
  const pageData = {
    parent: { page_id: parentId },
    properties: {
      title: {
        title: [{ text: { content: title } }]
      }
    }
  };

  if (icon) {
    pageData.icon = { type: 'emoji', emoji: icon };
  }

  const page = await notionRequest('/v1/pages', 'POST', pageData);
  console.log(`✅ Created: ${title} (ID: ${page.id})`);
  return page;
}

// Get existing child pages
async function getChildPages(parentId) {
  const response = await notionRequest(`/v1/blocks/${parentId}/children`, 'GET');
  return response.results.filter(block => block.type === 'child_page');
}

// Main function
async function main() {
  if (!NOTION_API_KEY) {
    console.error('❌ Error: NOTION_API_KEY not found in .env.notion');
    process.exit(1);
  }

  console.log('🚀 Creating Notion workspace structure...\n');
  console.log(`Main page ID: ${MAIN_PAGE_ID}\n`);

  const pageMapping = {};

  try {
    // Check existing pages
    console.log('📋 Checking existing pages...');
    const existingPages = await getChildPages(MAIN_PAGE_ID);
    console.log(`Found ${existingPages.length} existing child pages\n`);

    // Create category pages
    for (const [categoryName, categoryData] of Object.entries(WORKSPACE_STRUCTURE)) {
      // Check if category already exists
      const existing = existingPages.find(p => 
        p.child_page?.title === categoryName
      );

      let categoryPage;
      if (existing) {
        console.log(`⏭️  Category already exists: ${categoryName}`);
        categoryPage = { id: existing.id };
      } else {
        categoryPage = await createPage(MAIN_PAGE_ID, categoryName, categoryData.icon);
      }

      // Map docs to this category page
      for (const docPath of categoryData.docs) {
        const docName = docPath.split('/').pop().replace('.md', '');
        pageMapping[docPath] = {
          pageId: categoryPage.id,
          categoryName: categoryName,
          docName: docName
        };
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    // Save page mapping to file
    const mappingPath = join(__dirname, 'notion-page-mapping.json');
    fs.writeFileSync(mappingPath, JSON.stringify(pageMapping, null, 2));
    console.log(`\n✅ Page mapping saved to: ${mappingPath}`);

    console.log('\n📊 Workspace Structure Created:\n');
    console.log('🚀 First Responder Connect (Main Page)');
    for (const [categoryName, categoryData] of Object.entries(WORKSPACE_STRUCTURE)) {
      console.log(`├── ${categoryName}`);
      for (const docPath of categoryData.docs) {
        const docName = docPath.split('/').pop();
        console.log(`│   └── ${docName}`);
      }
    }

    console.log('\n✅ Workspace structure created successfully!');
    console.log('\n💡 Next steps:');
    console.log('   1. Run: node scripts/sync-to-notion.js');
    console.log('   2. Or run: bash scripts/sync-all-docs.sh');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);
