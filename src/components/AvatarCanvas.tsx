import { useEffect, useRef } from 'react';
import { drawAvatar, AVATAR_SIZE } from '@/lib/avatar';
import type { AvatarConfig } from '@/lib/avatar';

type Props = {
  config: AvatarConfig;
  /** number = px, string = CSS value (e.g. "100%") */
  size?: number | string;
  walking?: boolean;
  frame?: number;
  facing?: 'down' | 'up' | 'left' | 'right';
  className?: string;
};

export function AvatarCanvas({
  config,
  size = 96,
  walking = false,
  frame = 0,
  facing = 'down',
  className,
}: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawAvatar(ctx, config, { walking, frame, facing });
  }, [config, walking, frame, facing]);

  const sizeValue = typeof size === 'number' ? `${size}px` : size;

  return (
    <canvas
      ref={ref}
      className={`pixel ${className ?? ''}`}
      width={AVATAR_SIZE}
      height={AVATAR_SIZE}
      style={{ width: sizeValue, height: sizeValue, display: 'block' }}
    />
  );
}
