#!/usr/bin/env node

/**
 * Sync Documentation to Notion
 * 
 * This script syncs markdown documentation files to Notion pages.
 * 
 * Setup:
 * 1. Create a Notion integration at https://www.notion.so/my-integrations
 * 2. Share your Notion pages with the integration
 * 3. Set NOTION_API_KEY environment variable
 * 4. Update PAGE_IDS below with your Notion page IDs
 * 
 * Usage:
 *   node scripts/sync-to-notion.js
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.notion') });

// Configuration
const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_VERSION = '2022-06-28';

// Map your documentation files to Notion page IDs
// First Responder Connect main page: 2f1717e8-cf84-8173-8d3f-ebbde3c057bd
// Note: All docs currently sync to main page. Create sub-pages for better organization.
const PAGE_IDS = {
  'docs/IMPLEMENTATION_GUIDE.md': '2f1717e8-cf84-8173-8d3f-ebbde3c057bd',
  'docs/ROADMAP.md': '2f1717e8-cf84-8173-8d3f-ebbde3c057bd',
  'docs/QA_STRATEGY.md': '2f1717e8-cf84-8173-8d3f-ebbde3c057bd',
  'CHANGELOG.md': '2f1717e8-cf84-8173-8d3f-ebbde3c057bd',
  'docs/README.md': '2f1717e8-cf84-8173-8d3f-ebbde3c057bd',
  // To organize better, create sub-pages in Notion and update IDs here
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

// Convert markdown to Notion blocks (simplified)
function markdownToNotionBlocks(markdown) {
  const lines = markdown.split('\n');
  const blocks = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Heading 1
    if (line.startsWith('# ')) {
      blocks.push({
        object: 'block',
        type: 'heading_1',
        heading_1: {
          rich_text: [{ type: 'text', text: { content: line.slice(2) } }],
        },
      });
    }
    // Heading 2
    else if (line.startsWith('## ')) {
      blocks.push({
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: line.slice(3) } }],
        },
      });
    }
    // Heading 3
    else if (line.startsWith('### ')) {
      blocks.push({
        object: 'block',
        type: 'heading_3',
        heading_3: {
          rich_text: [{ type: 'text', text: { content: line.slice(4) } }],
        },
      });
    }
    // Code block
    else if (line.startsWith('```')) {
      let language = line.slice(3).trim() || 'plain text';
      
      // Map common languages to Notion-supported ones
      const languageMap = {
        'env': 'bash',
        'sh': 'shell',
        'ts': 'typescript',
        'js': 'javascript',
        'jsx': 'javascript',
        'tsx': 'typescript',
        'yml': 'yaml',
        'md': 'markdown',
      };
      
      language = languageMap[language.toLowerCase()] || language;
      
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      blocks.push({
        object: 'block',
        type: 'code',
        code: {
          rich_text: [{ type: 'text', text: { content: codeLines.join('\n') } }],
          language: language,
        },
      });
    }
    // Bullet list
    else if (line.startsWith('- ') || line.startsWith('* ')) {
      blocks.push({
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: line.slice(2) } }],
        },
      });
    }
    // Numbered list
    else if (/^\d+\.\s/.test(line)) {
      blocks.push({
        object: 'block',
        type: 'numbered_list_item',
        numbered_list_item: {
          rich_text: [{ type: 'text', text: { content: line.replace(/^\d+\.\s/, '') } }],
        },
      });
    }
    // Paragraph
    else if (line.trim()) {
      blocks.push({
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [{ type: 'text', text: { content: line } }],
        },
      });
    }
  }

  return blocks;
}

// Update a Notion page with markdown content
async function updateNotionPage(pageId, markdown) {
  console.log(`Updating Notion page: ${pageId}`);

  // First, get existing blocks
  const existingBlocks = await notionRequest(`/v1/blocks/${pageId}/children`, 'GET');

  // Delete existing blocks (archive them)
  for (const block of existingBlocks.results) {
    await notionRequest(`/v1/blocks/${block.id}`, 'DELETE');
  }

  // Convert markdown to Notion blocks
  const blocks = markdownToNotionBlocks(markdown);

  // Notion API has a limit of 100 blocks per request
  const chunkSize = 100;
  for (let i = 0; i < blocks.length; i += chunkSize) {
    const chunk = blocks.slice(i, i + chunkSize);
    await notionRequest(`/v1/blocks/${pageId}/children`, 'PATCH', {
      children: chunk,
    });
  }

  console.log(`✅ Updated page ${pageId}`);
}

// Main function
async function main() {
  if (!NOTION_API_KEY) {
    console.error('❌ Error: NOTION_API_KEY environment variable not set');
    console.error('Usage: NOTION_API_KEY=secret_xxx node scripts/sync-to-notion.js');
    process.exit(1);
  }

  console.log('🚀 Starting Notion sync...\n');

  for (const [filePath, pageId] of Object.entries(PAGE_IDS)) {
    if (pageId.startsWith('YOUR_')) {
      console.log(`⏭️  Skipping ${filePath} (page ID not configured)`);
      continue;
    }

    const fullPath = path.join(__dirname, '..', filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      continue;
    }

    const markdown = fs.readFileSync(fullPath, 'utf-8');
    
    try {
      await updateNotionPage(pageId, markdown);
    } catch (error) {
      console.error(`❌ Error updating ${filePath}:`, error.message);
    }
  }

  console.log('\n✅ Notion sync complete!');
}

main().catch(console.error);
