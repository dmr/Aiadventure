import { describe, it, expect } from 'vitest';
import { drawAvatar, DEFAULT_AVATAR } from './avatar';

// Mock context: record min/max y touched by fillRect to measure silhouette height.
function measure(height: number): { top: number; bottom: number } {
  let top = Infinity, bottom = -Infinity;
  const ctx = {
    imageSmoothingEnabled: false,
    fillStyle: '',
    clearRect() {},
    fillRect(_x: number, y: number, _w: number, h: number) {
      top = Math.min(top, y);
      bottom = Math.max(bottom, y + h);
    },
  } as unknown as CanvasRenderingContext2D;
  drawAvatar(ctx, { ...DEFAULT_AVATAR, height }, {});
  return { top, bottom };
}

describe('Größe affects silhouette height', () => {
  it('Groß is taller than Normal is taller than Klein', () => {
    const klein = measure(0), normal = measure(1), gross = measure(2);
    expect(gross.top).toBeLessThan(normal.top);
    expect(normal.top).toBeLessThan(klein.top);
    // feet roughly anchored
    expect(Math.abs(gross.bottom - klein.bottom)).toBeLessThanOrEqual(2);
  });
});
