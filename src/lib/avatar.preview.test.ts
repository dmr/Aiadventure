import { describe, it } from 'vitest';
import { writeFileSync } from 'node:fs';
import { Resvg } from '@resvg/resvg-js';
import { drawAvatar, DEFAULT_AVATAR, EXPRESSIONS, BODY_TYPES } from './avatar';

// Dev-only visual preview: render avatars to PNGs so we can eyeball the art.
// Not an assertion test — kept out of the normal run via PREVIEW_AVATARS=1.
const BG = '#efe2c6';

class SvgCtx {
  parts: string[] = [];
  fillStyle = '#000';
  imageSmoothingEnabled = false;
  clearRect(x: number, y: number, w: number, h: number) {
    this.parts.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${BG}"/>`);
  }
  fillRect(x: number, y: number, w: number, h: number) {
    this.parts.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${this.fillStyle}"/>`);
  }
}

function renderPng(cfg: Parameters<typeof drawAvatar>[1], out: string) {
  const ctx = new SvgCtx();
  drawAvatar(ctx as unknown as CanvasRenderingContext2D, cfg, { facing: 'down' });
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" shape-rendering="crispEdges">` +
    `<rect width="32" height="32" fill="${BG}"/>${ctx.parts.join('')}</svg>`;
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 192 } }).render().asPng();
  writeFileSync(out, png);
}

describe.runIf(process.env.PREVIEW_AVATARS === '1')('avatar preview', () => {
  it('renders expressions + bodies', () => {
    EXPRESSIONS.forEach((label, i) => {
      renderPng({ ...DEFAULT_AVATAR, expression: i }, `/tmp/av_expr_${i}_${label}.png`);
    });
    BODY_TYPES.forEach((label, i) => {
      renderPng({ ...DEFAULT_AVATAR, body: i, expression: 1 }, `/tmp/av_body_${i}_${label}.png`);
    });
    // a couple of "character" mixes
    renderPng({ skin: 4, hairStyle: 5, hairColor: 7, shirt: 3, pants: 9, accessory: 1, body: 3, height: 2, expression: 3 }, '/tmp/av_char_a.png');
    renderPng({ skin: 1, hairStyle: 2, hairColor: 4, shirt: 7, pants: 6, accessory: 6, body: 0, height: 0, expression: 1 }, '/tmp/av_char_b.png');
  });
});
