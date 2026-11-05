#!/usr/bin/env node
// Sắp chữ công thức TeX thành SVG cho lớp phủ (MathJax, dùng thư viện đã cài trong skill bai-giang-thpt).
//   node .claude/skills/video-3d-vat-ly/scripts/tex.js <thu-muc-video>/cong-thuc.js   → <thu-muc-video>/tex/<ten>.svg
// cong-thuc.js xuất { INK, C, F }:
//   INK: màu mực chính (nền tối: '#F2F2F2')
//   C:   tên màu tạm → mã màu, vd { qv: '#22C7E8' }; trong TeX viết \color{qv}{v}
//   F:   tên công thức → TeX (dùng String.raw`...`), dấu phẩy thập phân viết {,}
const fs = require('fs'); const path = require('path');
const file = path.resolve(process.argv[2] || 'cong-thuc.js');
const { INK = '#F2F2F2', C = {}, F } = require(file);
const NM = path.join(__dirname, '../../bai-giang-thpt/engine/node_modules');
if (!fs.existsSync(NM + '/mathjax-full')) { console.error('Chưa cài MathJax. Chạy: cd .claude/skills/bai-giang-thpt/engine && npm install'); process.exit(1); }
const { mathjax } = require(NM + '/mathjax-full/js/mathjax.js');
const { TeX } = require(NM + '/mathjax-full/js/input/tex.js');
const { SVG } = require(NM + '/mathjax-full/js/output/svg.js');
const { liteAdaptor } = require(NM + '/mathjax-full/js/adaptors/liteAdaptor.js');
const { RegisterHTMLHandler } = require(NM + '/mathjax-full/js/handlers/html.js');
const { AllPackages } = require(NM + '/mathjax-full/js/input/tex/AllPackages.js');
const adaptor = liteAdaptor(); RegisterHTMLHandler(adaptor);
const doc = mathjax.document('', { InputJax: new TeX({ packages: AllPackages }), OutputJax: new SVG({ fontCache: 'none' }) });
const out = path.join(path.dirname(file), 'tex'); fs.mkdirSync(out, { recursive: true });
for (const [name, tex] of Object.entries(F)) {
  let svg = adaptor.innerHTML(doc.convert(tex, { display: true }));
  if (/merror/.test(svg)) throw new Error('Lỗi TeX ở "' + name + '": ' + tex);
  for (const [k, v] of Object.entries(C)) svg = svg.split(`"${k}"`).join(`"${v}"`);
  svg = svg.replace(/currentColor/g, INK);
  fs.writeFileSync(path.join(out, name + '.svg'), svg);
  const vb = svg.match(/viewBox="([-\d.]+) ([-\d.]+) ([\d.]+) ([\d.]+)"/); console.log(name, vb ? `${vb[3]}x${vb[4]}` : '?');
}
