#!/usr/bin/env node
// Tải dữ liệu nét chữ (hanzi-writer-data, gốc từ Make Me a Hanzi) + cấu tạo/từ nguyên
// (dictionary.txt của Make Me a Hanzi) cho từng chữ, lưu thành <dir>/<chữ>.json.
// Dùng: node fetch-char.js <thư-mục-data> 休 好 明
const fs = require('fs');
const path = require('path');
const os = require('os');

const STROKE_URLS = (ch) => {
  const e = encodeURIComponent(ch);
  return [
    `https://raw.githubusercontent.com/chanind/hanzi-writer-data/master/data/${e}.json`,
    `https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1/${e}.json`,
    `https://unpkg.com/hanzi-writer-data@2.0.1/${e}.json`,
  ];
};
const DICT_URL = 'https://raw.githubusercontent.com/skishore/makemeahanzi/master/dictionary.txt';
const CACHE = path.join(os.homedir(), '.cache', 'triet-tu');

async function get(url) {
  const r = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.text();
}

async function strokes(ch) {
  try { return require(`hanzi-writer-data/${ch}.json`); } catch {}
  let last;
  for (const u of STROKE_URLS(ch)) {
    try { return JSON.parse(await get(u)); } catch (e) { last = e; }
  }
  throw new Error(`Không tải được nét chữ cho ${ch}: ${last && last.message}`);
}

let dictCache;
async function dict() {
  if (dictCache) return dictCache;
  const file = path.join(CACHE, 'dictionary.txt');
  if (!fs.existsSync(file)) {
    fs.mkdirSync(CACHE, { recursive: true });
    fs.writeFileSync(file, await get(DICT_URL));
  }
  dictCache = new Map();
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    const o = JSON.parse(line);
    dictCache.set(o.character, o);
  }
  return dictCache;
}

async function fetchChar(ch, dir) {
  const out = path.join(dir, `${ch}.json`);
  if (fs.existsSync(out)) return JSON.parse(fs.readFileSync(out, 'utf8'));
  const s = await strokes(ch);
  let info = {};
  try { info = (await dict()).get(ch) || {}; } catch (e) { console.warn('WARN dictionary:', e.message); }
  const data = {
    character: ch,
    strokes: s.strokes,
    medians: s.medians,
    radStrokes: s.radStrokes || [],
    matches: info.matches || [],
    decomposition: info.decomposition || '',
    etymology: info.etymology || null,
    pinyin: info.pinyin || [],
    definition: info.definition || '',
    radical: info.radical || '',
  };
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(out, JSON.stringify(data));
  return data;
}

module.exports = { fetchChar };

if (require.main === module) {
  const [dir, ...chars] = process.argv.slice(2);
  if (!dir || !chars.length) {
    console.error('Dùng: node fetch-char.js <thư-mục-data> 休 好 明');
    process.exit(1);
  }
  (async () => {
    for (const ch of chars.join('').replace(/\s/g, '')) {
      const d = await fetchChar(ch, dir);
      const comps = new Set(d.matches.map((m) => (m && m.length ? m[0] : 0)));
      console.log(`${ch}  ${d.pinyin.join(',')}  ${d.decomposition}  nét:${d.strokes.length}  phần:${comps.size}  ${d.etymology ? JSON.stringify(d.etymology) : ''}`);
    }
  })().catch((e) => { console.error(e.message); process.exit(1); });
}
