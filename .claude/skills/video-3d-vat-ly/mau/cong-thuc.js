// Công thức cho video (nền tối, mực trắng). Sắp chữ: node .claude/skills/video-3d-vat-ly/scripts/tex.js <thu-muc-video>/cong-thuc.js
module.exports = {
  INK: '#F2F2F2',
  C: { qv: '#22C7E8', qf: '#FF4D6D', qa: '#B66DFF', qo: '#FF8A3D' },
  F: {
    // chu kì con lắc đơn (dao động nhỏ)
    'chu-ki': String.raw`\color{qo}{T} = 2\pi\sqrt{\dfrac{l}{g}}`,
    // phương trình li độ góc
    'li-do': String.raw`\alpha = \alpha_0\cos(\omega t),\quad \omega = \sqrt{\dfrac{g}{l}}`,
  },
};
