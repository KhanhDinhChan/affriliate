#!/usr/bin/env node
// Tạo giọng đọc tiếng Việt cho từng beat bằng edge-tts (miễn phí, cần mạng tới Microsoft).
//   pip install edge-tts
//   node voice-edge.js <scene.js> [giọng] [tốc-độ]
// Giọng: vi-VN-HoaiMyNeural (nữ, mặc định) | vi-VN-NamMinhNeural (nam). Tốc độ ví dụ: +0% / -10% / +8%
// Ghi ra <thư-mục-scene>/<voiceDir || 'vo'>/NN.mp3 — render.js tự nhận khi scene có `voiceDir: 'vo'`.
// Muốn đọc khác chữ hiển thị (đa âm, tên riêng): đặt `speak: '...'` trong beat, phụ đề vẫn lấy `say`.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const [sceneArg, voice = 'vi-VN-HoaiMyNeural', rate = '+0%'] = process.argv.slice(2);
if (!sceneArg) { console.error('Dùng: node voice-edge.js <scene.js> [giọng] [tốc-độ]'); process.exit(1); }
const scenePath = path.resolve(sceneArg);
const scene = require(scenePath);
const outDir = path.join(path.dirname(scenePath), scene.voiceDir || 'vo');
fs.mkdirSync(outDir, { recursive: true });
scene.beats.forEach((b, i) => {
  const text = b.speak || b.say;
  if (!text) return;
  const f = path.join(outDir, `${String(i).padStart(2, '0')}.mp3`);
  const stamp = f + '.txt';
  const key = `${voice}|${rate}|${text}`;
  if (fs.existsSync(f) && fs.existsSync(stamp) && fs.readFileSync(stamp, 'utf8') === key) return; // đã có, khỏi tạo lại
  execFileSync('edge-tts', ['--voice', voice, `--rate=${rate}`, '--text', text, '--write-media', f], { stdio: 'inherit' });
  fs.writeFileSync(stamp, key);
  console.log(`beat ${i}: ${path.relative(process.cwd(), f)}`);
});
if (!scene.voiceDir) console.log(`\nNhớ thêm  voiceDir: '${path.basename(outDir)}'  vào scene để render.js dùng các file này.`);
