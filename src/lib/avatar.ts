// Procedural pixel-art avatar painter.
// Renders to a 32x32 canvas at 1x; CSS scales with image-rendering: pixelated.

export type AvatarConfig = {
  skin: number;
  hairStyle: number;
  hairColor: number;
  shirt: number;
  pants: number;
  accessory: number;
};

export const SKIN_COLORS = [
  '#f5d4ae', '#e8b88a', '#d29669', '#a87248', '#7a4a28', '#4a2818',
];

export const HAIR_COLORS = [
  '#1a0e08', '#3a2418', '#6b4220', '#a06830', '#d6a440', '#e6d090',
  '#a8a8a8', '#cf3a4f', '#3a5fbf', '#7a3aa8',
];

export const CLOTH_COLORS = [
  '#c97e4d', '#6b8e62', '#3e5b6b', '#a82e3a',
  '#d4a574', '#4a6d3f', '#2d4054', '#7a3a72',
  '#e4c98b', '#3a3a3a',
];

export const HAIR_STYLES = ['Kurz', 'Lang', 'Dutt', 'Glatze', 'Cap', 'Iro'];
export const ACCESSORIES = [
  'Keine', 'Brille', 'Hut', 'Kopfhörer', 'Mütze', 'Zylinder', 'Goldkette', 'Selfie-Stick',
];

export const DEFAULT_AVATAR: AvatarConfig = {
  skin: 1,
  hairStyle: 0,
  hairColor: 2,
  shirt: 0,
  pants: 6,
  accessory: 0,
};

// Random avatar (used for NPCs)
export function randomAvatar(seed: number): AvatarConfig {
  const r = mulberry32(seed);
  return {
    skin: Math.floor(r() * SKIN_COLORS.length),
    hairStyle: Math.floor(r() * HAIR_STYLES.length),
    hairColor: Math.floor(r() * HAIR_COLORS.length),
    shirt: Math.floor(r() * CLOTH_COLORS.length),
    pants: Math.floor(r() * CLOTH_COLORS.length),
    accessory: Math.floor(r() * ACCESSORIES.length),
  };
}

function mulberry32(a: number) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const AVATAR_SIZE = 32;

/** Body build — optional, derived from the (optional) gender/Anrede choice. */
export type Build = 'fem' | 'masc' | 'neutral';

export function buildFromGender(gender?: 'w' | 'm' | 'd'): Build {
  if (gender === 'w') return 'fem';
  if (gender === 'm') return 'masc';
  return 'neutral';
}

// Main draw function
export function drawAvatar(
  ctx: CanvasRenderingContext2D,
  cfg: AvatarConfig,
  opts: { walking?: boolean; frame?: number; facing?: 'down' | 'up' | 'left' | 'right'; build?: Build } = {}
) {
  const { walking = false, frame = 0, facing = 'down', build = 'neutral' } = opts;
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, AVATAR_SIZE, AVATAR_SIZE);

  const skin = SKIN_COLORS[cfg.skin] ?? SKIN_COLORS[0];
  const skinShade = shade(skin, -0.18);
  const hair = HAIR_COLORS[cfg.hairColor] ?? HAIR_COLORS[0];
  const hairShade = shade(hair, -0.25);
  const shirt = CLOTH_COLORS[cfg.shirt] ?? CLOTH_COLORS[0];
  const shirtShade = shade(shirt, -0.18);
  const pants = CLOTH_COLORS[cfg.pants] ?? CLOTH_COLORS[6];

  // No vertical body-bob — the walk reads through the alternating legs alone,
  // which keeps movement calm rather than bouncy.
  const bob = 0;

  // Shadow
  ctx.fillStyle = 'rgba(20, 12, 8, 0.28)';
  rect(ctx, 9, 30, 14, 1);
  rect(ctx, 7, 31, 18, 1);

  // Legs (alternate when walking)
  ctx.fillStyle = pants;
  const legAOffset = walking && frame === 1 ? -1 : 0;
  const legBOffset = walking && frame === 1 ? 0 : (walking ? -1 : 0);
  rect(ctx, 12, 26 + legAOffset + bob, 3, 4);
  rect(ctx, 17, 26 + legBOffset + bob, 3, 4);

  // Body / shirt — shoulder width varies subtly by build (centred on x=16).
  // 'neutral' reproduces the original geometry exactly.
  const shoulderX = build === 'masc' ? 9 : build === 'fem' ? 11 : 10;
  const shoulderW = build === 'masc' ? 14 : build === 'fem' ? 10 : 12;
  const armLX = shoulderX - 2;
  const armRX = shoulderX + shoulderW;
  ctx.fillStyle = shirtShade;
  rect(ctx, shoulderX, 18 + bob, shoulderW, 8); // base shirt
  ctx.fillStyle = shirt;
  rect(ctx, shoulderX + 1, 18 + bob, shoulderW - 2, 7); // shirt highlight
  // Hint of a waist for 'fem' (taper the lower torso by 1px each side).
  if (build === 'fem') {
    ctx.clearRect(shoulderX, 24 + bob, 1, 2);
    ctx.clearRect(shoulderX + shoulderW - 1, 24 + bob, 1, 2);
  }

  // Arms
  ctx.fillStyle = shirt;
  rect(ctx, armLX, 19 + bob, 2, 5);
  rect(ctx, armRX, 19 + bob, 2, 5);
  // Hands
  ctx.fillStyle = skin;
  rect(ctx, armLX, 24 + bob, 2, 2);
  rect(ctx, armRX, 24 + bob, 2, 2);

  // Neck
  ctx.fillStyle = skinShade;
  rect(ctx, 13, 17 + bob, 6, 1);

  // Head: skin block
  ctx.fillStyle = skin;
  rect(ctx, 10, 6 + bob, 12, 11);
  // Round corners (cut top)
  ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.clearRect(10, 6 + bob, 1, 1);
  ctx.clearRect(21, 6 + bob, 1, 1);
  ctx.clearRect(10, 16 + bob, 1, 1);
  ctx.clearRect(21, 16 + bob, 1, 1);

  // Cheeks shading
  ctx.fillStyle = skinShade;
  rect(ctx, 10, 13 + bob, 1, 3);
  rect(ctx, 21, 13 + bob, 1, 3);

  // Hair
  drawHair(ctx, cfg.hairStyle, hair, hairShade, bob, facing);

  // Face details
  if (facing !== 'up') {
    drawFace(ctx, bob, facing);
  }

  // Accessory
  if (cfg.accessory > 0 && facing !== 'up') {
    drawAccessory(ctx, cfg.accessory, bob);
  }
}

function drawFace(ctx: CanvasRenderingContext2D, bob: number, facing: string) {
  const eyeY = 11 + bob;
  ctx.fillStyle = '#1a1410';
  if (facing === 'left') {
    rect(ctx, 12, eyeY, 1, 2);
    rect(ctx, 15, eyeY, 1, 2);
  } else if (facing === 'right') {
    rect(ctx, 16, eyeY, 1, 2);
    rect(ctx, 19, eyeY, 1, 2);
  } else {
    rect(ctx, 13, eyeY, 1, 2);
    rect(ctx, 18, eyeY, 1, 2);
  }
  // Subtle mouth
  ctx.fillStyle = 'rgba(80, 30, 20, 0.55)';
  rect(ctx, 15, 14 + bob, 2, 1);
}

function drawHair(
  ctx: CanvasRenderingContext2D,
  style: number,
  color: string,
  shadeColor: string,
  bob: number,
  _facing: string
) {
  ctx.fillStyle = color;
  switch (style) {
    case 0: // Short
      rect(ctx, 10, 5 + bob, 12, 4);
      rect(ctx, 11, 4 + bob, 10, 1);
      ctx.fillStyle = shadeColor;
      rect(ctx, 10, 8 + bob, 1, 2);
      rect(ctx, 21, 8 + bob, 1, 2);
      break;
    case 1: // Long
      rect(ctx, 10, 5 + bob, 12, 5);
      rect(ctx, 11, 4 + bob, 10, 1);
      rect(ctx, 9, 7 + bob, 1, 7);
      rect(ctx, 22, 7 + bob, 1, 7);
      ctx.fillStyle = shadeColor;
      rect(ctx, 9, 13 + bob, 1, 2);
      rect(ctx, 22, 13 + bob, 1, 2);
      break;
    case 2: // Bun
      rect(ctx, 10, 5 + bob, 12, 3);
      rect(ctx, 11, 4 + bob, 10, 1);
      rect(ctx, 14, 2 + bob, 4, 3); // bun
      ctx.fillStyle = shadeColor;
      rect(ctx, 14, 4 + bob, 4, 1);
      break;
    case 3: // Glatze (bald) - just thin sideburns
      ctx.fillStyle = shadeColor;
      rect(ctx, 11, 7 + bob, 1, 2);
      rect(ctx, 20, 7 + bob, 1, 2);
      break;
    case 4: // Cap
      ctx.fillStyle = color;
      rect(ctx, 10, 5 + bob, 12, 3);
      rect(ctx, 11, 4 + bob, 10, 1);
      // Cap brim (always to the side)
      rect(ctx, 19, 7 + bob, 4, 1);
      ctx.fillStyle = shadeColor;
      rect(ctx, 10, 7 + bob, 12, 1);
      break;
    case 5: // Iro / Mohawk
      rect(ctx, 14, 3 + bob, 4, 6);
      rect(ctx, 15, 2 + bob, 2, 1);
      ctx.fillStyle = shadeColor;
      rect(ctx, 14, 8 + bob, 4, 1);
      break;
  }
}

function drawAccessory(ctx: CanvasRenderingContext2D, type: number, bob: number) {
  switch (type) {
    case 1: // Glasses
      ctx.fillStyle = '#1a1410';
      rect(ctx, 12, 10 + bob, 4, 3);
      rect(ctx, 16, 10 + bob, 4, 3);
      rect(ctx, 16, 11 + bob, 1, 1); // bridge
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      rect(ctx, 13, 10 + bob, 1, 1);
      rect(ctx, 17, 10 + bob, 1, 1);
      break;
    case 2: // Hat (top hat-ish)
      ctx.fillStyle = '#2a1a10';
      rect(ctx, 8, 4 + bob, 16, 1); // brim
      rect(ctx, 11, 1 + bob, 10, 4); // top
      ctx.fillStyle = '#c97e4d';
      rect(ctx, 11, 4 + bob, 10, 1); // band
      break;
    case 3: // Headphones
      ctx.fillStyle = '#1a1410';
      rect(ctx, 9, 7 + bob, 1, 4);
      rect(ctx, 22, 7 + bob, 1, 4);
      rect(ctx, 9, 5 + bob, 14, 1);
      rect(ctx, 10, 4 + bob, 12, 1);
      ctx.fillStyle = '#c97e4d';
      rect(ctx, 9, 8 + bob, 2, 2);
      rect(ctx, 21, 8 + bob, 2, 2);
      break;
    case 4: // Beanie / Mütze (snug knit cap)
      ctx.fillStyle = '#3a5fbf';
      rect(ctx, 9, 5 + bob, 14, 3);   // band
      rect(ctx, 10, 3 + bob, 12, 2);  // dome
      rect(ctx, 14, 2 + bob, 4, 1);   // bobble base
      ctx.fillStyle = '#e6e0d0';
      rect(ctx, 15, 1 + bob, 2, 1);   // pom-pom
      ctx.fillStyle = '#2c4a99';
      rect(ctx, 9, 7 + bob, 14, 1);   // folded rim shadow
      break;
    case 5: // Zylinder (tall top hat)
      ctx.fillStyle = '#1d1d22';
      rect(ctx, 7, 5 + bob, 18, 1);   // wide brim
      rect(ctx, 10, 0 + bob, 12, 5);  // tall crown
      ctx.fillStyle = '#a82e3a';
      rect(ctx, 10, 4 + bob, 12, 1);  // band
      break;
    case 6: // Goldkette (gold chain on the chest)
      ctx.fillStyle = '#e6c200';
      rect(ctx, 13, 18 + bob, 1, 1);
      rect(ctx, 18, 18 + bob, 1, 1);
      rect(ctx, 14, 19 + bob, 1, 1);
      rect(ctx, 17, 19 + bob, 1, 1);
      rect(ctx, 15, 20 + bob, 2, 1); // pendant
      ctx.fillStyle = '#fff3a0';
      rect(ctx, 15, 20 + bob, 1, 1); // shine
      break;
    case 7: { // Selfie-Stick (held out to the right)
      ctx.fillStyle = '#5a5a5a';
      // diagonal pole from the right hand upward-out
      rect(ctx, 24, 22 + bob, 1, 2);
      rect(ctx, 25, 19 + bob, 1, 3);
      rect(ctx, 26, 16 + bob, 1, 3);
      rect(ctx, 27, 13 + bob, 1, 3);
      ctx.fillStyle = '#1a1a1a';
      rect(ctx, 26, 10 + bob, 4, 4); // phone body
      ctx.fillStyle = '#6cc6ff';
      rect(ctx, 27, 11 + bob, 2, 2); // screen
      break;
    }
  }
}

function rect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillRect(x, y, w, h);
}

// Colour shading helper
function shade(hex: string, amount: number): string {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const adj = (v: number) => Math.max(0, Math.min(255, Math.round(v + v * amount)));
  return `rgb(${adj(r)}, ${adj(g)}, ${adj(b)})`;
}
