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
 * 4. Run create-notion-workspace.js to create the page structure
 * 
 * Usage:
 *   node scripts/sync-to-notion.js [file-path]
 *   
 * Examples:
 *   node scripts/sync-to-notion.js                    # Sync all docs
 *   node scripts/sync-to-notion.js README.md          # Sync specific file
 *   node scripts/sync-to-notion.js docs/ARCHITECTURE.md
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

// Load page mapping from generated file
let PAGE_MAPPING = {};
const mappingPath = join(__dirname, 'notion-page-mapping.json');

if (fs.existsSync(mappingPath)) {
  PAGE_MAPPING = JSON.parse(fs.readFileSync(mappingPath, 'utf-8'));
} else {
  console.error('❌ Error: notion-page-mapping.json not found!');
  console.error('💡 Run: node scripts/create-notion-workspace.js first');
  process.exit(1);
}

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
      
      const codeContent = codeLines.join('\n');
      
      // Notion has a 2000 character limit for code blocks
      // Split large code blocks into multiple blocks
      if (codeContent.length > 1900) {
        const chunks = [];
        let currentChunk = '';
        
        for (const codeLine of codeLines) {
          if ((currentChunk + codeLine + '\n').length > 1900) {
            if (currentChunk) chunks.push(currentChunk);
            currentChunk = codeLine + '\n';
          } else {
            currentChunk += codeLine + '\n';
          }
        }
        if (currentChunk) chunks.push(currentChunk);
        
        // Add each chunk as a separate code block
        chunks.forEach((chunk, idx) => {
          blocks.push({
            object: 'block',
            type: 'code',
            code: {
              rich_text: [{ type: 'text', text: { content: chunk.trim() } }],
              language: language,
            },
          });
          // Add a note for continuation
          if (idx < chunks.length - 1) {
            blocks.push({
              object: 'block',
              type: 'paragraph',
              paragraph: {
                rich_text: [{ type: 'text', text: { content: '(continued...)' } }],
              },
            });
          }
        });
      } else {
        blocks.push({
          object: 'block',
          type: 'code',
          code: {
            rich_text: [{ type: 'text', text: { content: codeContent } }],
            language: language,
          },
        });
      }
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
}

// Main function
async function main() {
  if (!NOTION_API_KEY) {
    console.error('❌ Error: NOTION_API_KEY environment variable not set');
    console.error('Usage: NOTION_API_KEY=secret_xxx node scripts/sync-to-notion.js');
    process.exit(1);
  }

  // Check if specific file was requested
  const targetFile = process.argv[2];
  let filesToSync = Object.keys(PAGE_MAPPING);

  if (targetFile) {
    // Normalize the path
    const normalizedTarget = targetFile.startsWith('docs/') ? targetFile : targetFile;
    if (PAGE_MAPPING[normalizedTarget]) {
      filesToSync = [normalizedTarget];
      console.log(`🎯 Syncing specific file: ${normalizedTarget}\n`);
    } else {
      console.error(`❌ Error: File not found in mapping: ${targetFile}`);
      console.error('Available files:');
      Object.keys(PAGE_MAPPING).forEach(f => console.error(`  - ${f}`));
      process.exit(1);
    }
  } else {
    console.log('🚀 Starting full Notion sync...\n');
  }

  let successCount = 0;
  let errorCount = 0;

  for (const filePath of filesToSync) {
    const mapping = PAGE_MAPPING[filePath];
    const fullPath = path.join(__dirname, '..', filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      errorCount++;
      continue;
    }

    console.log(`📄 Syncing: ${filePath}`);
    console.log(`   → Category: ${mapping.categoryName}`);
    console.log(`   → Page ID: ${mapping.pageId}`);

    const markdown = fs.readFileSync(fullPath, 'utf-8');
    
    try {
      await updateNotionPage(mapping.pageId, markdown);
      successCount++;
      console.log(`   ✅ Success\n`);
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}\n`);
      errorCount++;
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  console.log('\n' + '='.repeat(60));
  console.log(`✅ Sync complete!`);
  console.log(`   Success: ${successCount} files`);
  if (errorCount > 0) {
    console.log(`   Errors: ${errorCount} files`);
  }
  console.log('='.repeat(60));
}

main().catch(console.error);
