// Generates PWA PNG icons from public/app-icon.svg using @resvg/resvg-js.
// Run with: pnpm gen:icons
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { Resvg } from '@resvg/resvg-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const svg = readFileSync(resolve(root, 'public/app-icon.svg'), 'utf-8');

/** @param {number} size */
function render(size) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: size },
    background: '#f5e8d0',
  });
  return resvg.render().asPng();
}

const targets = [
  ['public/pwa-192x192.png', 192],
  ['public/pwa-512x512.png', 512],
  // Maskable: same artwork, full-bleed background already covers the safe zone.
  ['public/maskable-512x512.png', 512],
  ['public/apple-touch-icon.png', 180],
];

for (const [out, size] of targets) {
  writeFileSync(resolve(root, out), render(size));
  console.log(`✓ ${out} (${size}px)`);
}
