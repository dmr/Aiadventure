import { describe, it, expect } from 'vitest';
import {
  DEFAULT_AVATAR,
  randomAvatar,
  SKIN_COLORS,
  HAIR_COLORS,
  HAIR_STYLES,
  CLOTH_COLORS,
  ACCESSORIES,
  type AvatarConfig,
} from './avatar';

function expectInRange(cfg: AvatarConfig) {
  expect(cfg.skin).toBeGreaterThanOrEqual(0);
  expect(cfg.skin).toBeLessThan(SKIN_COLORS.length);
  expect(cfg.hairStyle).toBeGreaterThanOrEqual(0);
  expect(cfg.hairStyle).toBeLessThan(HAIR_STYLES.length);
  expect(cfg.hairColor).toBeGreaterThanOrEqual(0);
  expect(cfg.hairColor).toBeLessThan(HAIR_COLORS.length);
  expect(cfg.shirt).toBeGreaterThanOrEqual(0);
  expect(cfg.shirt).toBeLessThan(CLOTH_COLORS.length);
  expect(cfg.pants).toBeGreaterThanOrEqual(0);
  expect(cfg.pants).toBeLessThan(CLOTH_COLORS.length);
  expect(cfg.accessory).toBeGreaterThanOrEqual(0);
  expect(cfg.accessory).toBeLessThan(ACCESSORIES.length);
}

describe('avatar config', () => {
  it('DEFAULT_AVATAR uses valid indices for every palette', () => {
    expectInRange(DEFAULT_AVATAR);
  });

  it('randomAvatar produces in-range configs for many seeds', () => {
    for (let seed = 0; seed < 200; seed++) {
      expectInRange(randomAvatar(seed));
    }
  });

  it('randomAvatar is deterministic for a given seed', () => {
    expect(randomAvatar(42)).toEqual(randomAvatar(42));
  });

  it('different seeds generally produce different avatars', () => {
    expect(randomAvatar(1)).not.toEqual(randomAvatar(2));
  });
});
