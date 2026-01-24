#!/usr/bin/env node

/**
 * Find Notion Pages
 * 
 * This script searches for pages in your Notion workspace
 * to help you find the page IDs needed for syncing.
 * 
 * Usage:
 *   node scripts/find-notion-pages.js
 */

import https from 'https';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.notion') });

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_VERSION = '2022-06-28';

function notionRequest(endpoint, method = 'GET', data = null) {
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
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            resolve(body);
          }
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

async function searchPages(query = '') {
  try {
    const response = await notionRequest('/v1/search', 'POST', {
      query: query,
      filter: {
        property: 'object',
        value: 'page'
      },
      sort: {
        direction: 'descending',
        timestamp: 'last_edited_time'
      }
    });

    return response.results || [];
  } catch (error) {
    console.error('Error searching pages:', error.message);
    return [];
  }
}

async function main() {
  if (!NOTION_API_KEY) {
    console.error('❌ Error: NOTION_API_KEY not found in .env.notion');
    console.error('Make sure .env.notion exists with your API key');
    process.exit(1);
  }

  console.log('🔍 Searching for Notion pages...\n');

  // Search for "First Responder" or "Paranet" pages
  const queries = ['First Responder', 'Paranet', 'Pipeline', ''];
  const allPages = new Map();

  for (const query of queries) {
    console.log(`Searching for: "${query || 'all pages'}"...`);
    const pages = await searchPages(query);
    
    for (const page of pages) {
      const title = page.properties?.title?.title?.[0]?.plain_text || 
                    page.properties?.Name?.title?.[0]?.plain_text ||
                    'Untitled';
      allPages.set(page.id, { id: page.id, title, url: page.url });
    }
  }

  console.log(`\n📄 Found ${allPages.size} pages:\n`);
  console.log('─'.repeat(80));

  for (const [id, page] of allPages) {
    console.log(`Title: ${page.title}`);
    console.log(`ID:    ${id}`);
    console.log(`URL:   ${page.url}`);
    console.log('─'.repeat(80));
  }

  console.log('\n💡 To use these pages:');
  console.log('1. Find your "First Responder Connect" or "Project Pipeline" page above');
  console.log('2. Copy the page ID');
  console.log('3. Update scripts/sync-to-notion.js with the page IDs');
  console.log('\n⚠️  Note: Make sure you\'ve shared these pages with your Notion integration!');
  console.log('   (Open page → ... → Connections → Add "Blackbox CLI")');
}

main().catch(console.error);
