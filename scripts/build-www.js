// JavaScript · scripts/build-www.js · Node 18+ · baut den Ordner www/ (App-Inhalt) komplett offline-fähig
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const www = path.join(root, 'www');
const nm = path.join(root, 'node_modules');

fs.rmSync(www, { recursive: true, force: true });
fs.mkdirSync(path.join(www, 'lib'), { recursive: true });
fs.mkdirSync(path.join(www, 'fonts'), { recursive: true });

fs.copyFileSync(path.join(root, 'src', 'index.html'), path.join(www, 'index.html'));

for (const f of ['pdf.min.js', 'pdf.worker.min.js']) {
  fs.copyFileSync(path.join(nm, 'pdfjs-dist', 'build', f), path.join(www, 'lib', f));
}

const faces = [
  ['barlow-condensed', 'Barlow Condensed', [500, 600, 700]],
  ['ibm-plex-sans', 'IBM Plex Sans', [400, 500, 600]],
  ['ibm-plex-mono', 'IBM Plex Mono', [400, 500]],
];
let css = '';
for (const [pkg, family, weights] of faces) {
  for (const w of weights) {
    for (const subset of ['latin', 'latin-ext']) {
      const file = `${pkg}-${subset}-${w}-normal.woff2`;
      const from = path.join(nm, '@fontsource', pkg, 'files', file);
      if (!fs.existsSync(from)) throw new Error(`Schrift fehlt: ${from}`);
      fs.copyFileSync(from, path.join(www, 'fonts', file));
      const range = subset === 'latin'
        ? 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD'
        : 'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF';
      css += `@font-face{font-family:"${family}";font-style:normal;font-weight:${w};font-display:swap;src:url(${file}) format("woff2");unicode-range:${range}}\n`;
    }
  }
}
fs.writeFileSync(path.join(www, 'fonts', 'fonts.css'), css);
console.log('www/ gebaut');
