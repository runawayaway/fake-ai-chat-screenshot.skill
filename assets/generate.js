#!/usr/bin/env node
/**
 * AI Chat Screenshot Generator
 * Usage:
 *   node generate.js '<tasks_json>' <output_dir>
 *
 * tasks_json: JSON array of task objects:
 * [
 *   {
 *     "platform":      "chatgpt" | "claude" | "deepseek" | "gemini" | "grok" | "doubao",
 *     "messages":      [{"role":"user"|"ai", "content":"..."}],
 *     "filename":      "chatgpt.png",          // optional, defaults to <platform>.png
 *     "thinking_time": "4",                    // optional, for deepseek/grok
 *     "time":          "9:41"                  // optional, for chatgpt status bar
 *   },
 *   ...
 * ]
 *
 * output_dir: directory to save PNGs (created if not exists)
 */

'use strict';

const { chromium } = require(
  'C:/Users/18769/.vscode/extensions/oderwat.indent-rainbow-8.3.1/node_modules/playwright'
);
const PW_CHROME = 'C:/Users/18769/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe';
const TEMPLATE  = require('path').join(__dirname, 'template.html');

const path = require('path');
const fs   = require('fs');
const os   = require('os');
const crypto = require('crypto');

async function generateOne(browser, task, outDir) {
  const {
    platform,
    messages,
    filename      = platform + '.png',
    thinking_time = '4',
    time          = '9:41',
  } = task;

  // Encode messages as base64 JSON
  const msgsB64 = Buffer.from(JSON.stringify(messages)).toString('base64');
  const qs = new URLSearchParams({ platform, msgs: msgsB64, thinking_time, time }).toString();

  // Copy template to a temp file (avoids file:// encoding issues with query strings)
  const tmp = path.join(os.tmpdir(), 'aic_' + crypto.randomBytes(4).toString('hex') + '.html');
  fs.copyFileSync(TEMPLATE, tmp);
  const url = 'file:///' + tmp.replace(/\\/g, '/') + '?' + qs;

  const page = await browser.newPage({ deviceScaleFactor: 2 });
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);

  const outPath = path.join(outDir, filename);
  const el = await page.locator('#phone');
  await el.screenshot({ path: outPath });
  await page.close();
  fs.unlinkSync(tmp);

  return outPath;
}

async function main() {
  const [,, tasksArg, outDir] = process.argv;

  if (!tasksArg || !outDir) {
    console.error('Usage:');
    console.error('  node generate.js <tasks.json> <output_dir>   # file path');
    console.error('  node generate.js \'[...]\' <output_dir>        # inline JSON');
    process.exit(1);
  }

  let tasks;
  try {
    // Support both file path and inline JSON
    const raw = fs.existsSync(tasksArg)
      ? fs.readFileSync(tasksArg, 'utf8')
      : tasksArg;
    tasks = JSON.parse(raw);
  } catch (e) {
    console.error('Invalid JSON or file not found:', e.message);
    process.exit(1);
  }

  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({ executablePath: PW_CHROME });
  const results = [];

  for (const task of tasks) {
    try {
      const p = await generateOne(browser, task, outDir);
      console.log('✓', task.platform, '->', p);
      results.push({ platform: task.platform, path: p, ok: true });
    } catch (err) {
      console.error('✗', task.platform, err.message);
      results.push({ platform: task.platform, error: err.message, ok: false });
    }
  }

  await browser.close();

  // Print JSON summary so callers can parse results
  console.log('\n' + JSON.stringify(results, null, 2));
}

main().catch(e => { console.error(e); process.exit(1); });
