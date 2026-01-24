#!/usr/bin/env node

/**
 * Test Notion API Connection
 */

import https from 'https';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.notion') });

const NOTION_API_KEY = process.env.NOTION_API_KEY;

function notionRequest(endpoint, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.notion.com',
      path: endpoint,
      method: method,
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Response: ${body}\n`);
        
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            resolve(body);
          }
        } else {
          reject(new Error(`API error: ${res.statusCode} - ${body}`));
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function main() {
  console.log('🔑 Testing Notion API Key...\n');
  console.log(`API Key: ${NOTION_API_KEY?.substring(0, 10)}...${NOTION_API_KEY?.substring(NOTION_API_KEY.length - 5)}\n`);

  try {
    console.log('📡 Testing /v1/users/me endpoint...');
    const user = await notionRequest('/v1/users/me');
    console.log('✅ API Key is valid!');
    console.log(`Bot Name: ${user.name || 'N/A'}`);
    console.log(`Bot Type: ${user.type || 'N/A'}`);
    console.log(`Owner: ${user.owner?.type || 'N/A'}\n`);

    console.log('📡 Testing /v1/search endpoint...');
    const search = await notionRequest('/v1/search', 'POST', {
      page_size: 10
    });
    
    console.log(`✅ Found ${search.results?.length || 0} accessible pages/databases`);
    
    if (search.results && search.results.length > 0) {
      console.log('\n📄 Accessible pages:');
      search.results.forEach((item, i) => {
        const title = item.properties?.title?.title?.[0]?.plain_text || 
                      item.properties?.Name?.title?.[0]?.plain_text ||
                      'Untitled';
        console.log(`${i + 1}. ${title} (${item.object}) - ID: ${item.id}`);
      });
    } else {
      console.log('\n⚠️  No pages found. This means:');
      console.log('   1. You haven\'t shared any pages with this integration yet');
      console.log('   2. Or the integration doesn\'t have access to any pages');
      console.log('\n💡 To fix:');
      console.log('   1. Open your Notion page');
      console.log('   2. Click "..." → "Connections"');
      console.log('   3. Add your integration');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main().catch(console.error);
