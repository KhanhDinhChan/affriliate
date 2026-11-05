// Sắp chữ công thức TeX thành SVG (MathJax, dùng thư viện đã cài trong skill bai-giang-thpt).
// Chạy: node tex.js  → tex/*.svg (mực xanh đen; màu đại lượng theo quy ước kênh)
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

const INK = '#22305A';
// \color{qf}… là tên tạm, thay bằng mã màu sau khi sắp chữ
const C = { qf: '#E11D48', qv: '#0891B2', qa: '#7C3AED', qhl: '#E8740C' };
const F = {
  // P − F_từ = m·a   (lực: đỏ hồng, gia tốc: tím)
  'dinh-luat-2': String.raw`\color{qf}{P} - \color{qf}{F_{\text{từ}}} = m\,\color{qa}{a}`,
  // F_từ = k·v
  'luc-tu': String.raw`\color{qf}{F_{\text{từ}}} = k\,\color{qv}{v}`,
  // F_từ = P ⇒ a = 0 ⇒ v = v_T
  'can-bang': String.raw`\color{qf}{F_{\text{từ}}} = \color{qf}{P} \;\Rightarrow\; \color{qa}{a} = 0 \;\Rightarrow\; \color{qv}{v} = \color{qhl}{v_T}`,
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
