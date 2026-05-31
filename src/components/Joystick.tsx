import { useRef, useState, useCallback, useEffect } from 'react';

type Vec = { x: number; y: number };

type Props = {
  onChange: (v: Vec) => void;
  size?: number;
};

/**
 * Virtual joystick. Returns a normalized vector (-1..1, -1..1).
 * When the user is not interacting, emits {0, 0}.
 */
export function Joystick({ onChange, size = 110 }: Props) {
  const baseRef = useRef<HTMLDivElement | null>(null);
  const [stick, setStick] = useState<Vec>({ x: 0, y: 0 });
  const [active, setActive] = useState(false);

  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      const el = baseRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = clientX - cx;
      const dy = clientY - cy;
      const r = rect.width / 2;
      const dist = Math.hypot(dx, dy);
      const clamped = Math.min(dist, r);
      const angle = Math.atan2(dy, dx);
      const sx = Math.cos(angle) * clamped;
      const sy = Math.sin(angle) * clamped;
      setStick({ x: sx, y: sy });
      onChange({ x: sx / r, y: sy / r });
    },
    [onChange]
  );

  const reset = useCallback(() => {
    setStick({ x: 0, y: 0 });
    setActive(false);
    onChange({ x: 0, y: 0 });
  }, [onChange]);

  // Global pointer handlers so the joystick keeps working
  // even if the finger leaves the joystick area
  useEffect(() => {
    if (!active) return;
    const onPointerMove = (e: PointerEvent) => {
      handleMove(e.clientX, e.clientY);
    };
    const onPointerUp = () => reset();
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };
  }, [active, handleMove, reset]);

  return (
    <div
      ref={baseRef}
      onPointerDown={(e) => {
        (e.target as Element).setPointerCapture?.(e.pointerId);
        setActive(true);
        handleMove(e.clientX, e.clientY);
      }}
      className="relative no-select touch-none rounded-full"
      style={{
        width: size,
        height: size,
        background: 'radial-gradient(circle, hsl(var(--secondary) / 0.7), hsl(var(--secondary) / 0.4))',
        border: '2px solid hsl(var(--border))',
        boxShadow: '0 4px 12px hsl(22 35% 13% / 0.15), inset 0 0 0 4px hsl(var(--cream) / 0.4)',
      }}
    >
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: size * 0.45,
          height: size * 0.45,
          left: '50%',
          top: '50%',
          transform: `translate(calc(-50% + ${stick.x}px), calc(-50% + ${stick.y}px))`,
          background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(22 50% 38%))',
          boxShadow: '0 2px 8px hsl(22 35% 13% / 0.3)',
          transition: active ? 'none' : 'transform 0.15s ease-out',
        }}
      />
    </div>
  );
}
