// Sắp chữ công thức TeX thành SVG (MathJax, dùng thư viện đã cài trong skill bai-giang-thpt).
// Chạy: node tex.js  → tex/*.svg (mực trắng cho nền tối; Φ xanh lá, I vàng hổ phách, Q cam)
const fs = require('fs'); const path = require('path');
const NM = path.join(__dirname, '../../.claude/skills/bai-giang-thpt/engine/node_modules');
const { mathjax } = require(NM + '/mathjax-full/js/mathjax.js');
const { TeX } = require(NM + '/mathjax-full/js/input/tex.js');
const { SVG } = require(NM + '/mathjax-full/js/output/svg.js');
const { liteAdaptor } = require(NM + '/mathjax-full/js/adaptors/liteAdaptor.js');
const { RegisterHTMLHandler } = require(NM + '/mathjax-full/js/handlers/html.js');
const { AllPackages } = require(NM + '/mathjax-full/js/input/tex/AllPackages.js');
const adaptor = liteAdaptor(); RegisterHTMLHandler(adaptor);
const doc = mathjax.document('', { InputJax: new TeX({ packages: AllPackages }), OutputJax: new SVG({ fontCache: 'none' }) });

const INK = '#F2F2F2';
// \color{qf}… là tên tạm, thay bằng mã màu sau khi sắp chữ
const C = { qphi: '#4ADE80', qi: '#FBBF24', qq: '#FB7A3C' };
const F = {
  // định luật Faraday: suất điện động cảm ứng
  'faraday': String.raw`e_c = -\dfrac{\Delta\color{qphi}{\Phi}}{\Delta t}`,
  // định luật Joule: nhiệt toả ra trên đáy nồi
  'joule': String.raw`\color{qq}{Q} = \color{qi}{I}^2 R\,t`,
};
fs.mkdirSync(path.join(__dirname, 'tex'), { recursive: true });
for (const [name, tex] of Object.entries(F)) {
  let svg = adaptor.innerHTML(doc.convert(tex, { display: true }));
  if (/merror/.test(svg)) throw new Error('Lỗi TeX: ' + tex);
  for (const [k, v] of Object.entries(C)) svg = svg.split(`"${k}"`).join(`"${v}"`);
  svg = svg.replace(/currentColor/g, INK);
  fs.writeFileSync(path.join(__dirname, 'tex', name + '.svg'), svg);
  const vb = svg.match(/viewBox="([-\d.]+) ([-\d.]+) ([\d.]+) ([\d.]+)"/); console.log(name, vb ? `${vb[3]}x${vb[4]}` : '?');
}
