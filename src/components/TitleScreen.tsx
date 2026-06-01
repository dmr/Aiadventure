import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

type Props = {
  onStart: () => void;
};

export function TitleScreen({ onStart }: Props) {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-6 py-10 relative overflow-hidden">
      {/* Floating decorative elements */}
      <div className="absolute top-12 left-8 text-5xl opacity-30 animate-pulse" style={{ animationDuration: '3s' }}>☕</div>
      <div className="absolute top-24 right-12 text-4xl opacity-25" style={{ transform: 'rotate(15deg)' }}>📖</div>
      <div className="absolute bottom-20 left-12 text-5xl opacity-25" style={{ transform: 'rotate(-10deg)' }}>🪴</div>
      <div className="absolute bottom-32 right-8 text-4xl opacity-30">🥐</div>

      <div className="text-center max-w-md float-in relative z-10">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">
          Willkommen im
        </p>
        <h1 className="display-font text-6xl sm:text-7xl font-bold leading-none mb-2">
          Café
          <br />
          <span style={{ color: 'hsl(var(--terracotta))' }}>Campfire</span>
        </h1>
        <div className="flex items-center justify-center gap-3 my-5">
          <div className="h-px bg-foreground/30 flex-1 max-w-[60px]" />
          <span className="text-2xl">🔥</span>
          <div className="h-px bg-foreground/30 flex-1 max-w-[60px]" />
        </div>
        <p className="text-base sm:text-lg leading-relaxed mb-8">
          <span className="text-foreground font-medium">
            Am Lagerfeuer erzählt man sich Geschichten — hier echte aus echten Codebases.
          </span>
          <br />
          <span className="text-muted-foreground">
            In 20 Minuten lernst du, wann Claude Code brilliert, wann es dich reinlegt
            und wie du den Unterschied steuerst.
          </span>
        </p>

        <Button
          onClick={onStart}
          size="lg"
          className="h-14 px-8 display-font text-lg font-semibold shadow-lg group"
        >
          Reinkommen
          <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
        </Button>

        <p className="text-xs text-muted-foreground mt-8 leading-relaxed">
          Steuerung: <kbd className="px-1.5 py-0.5 bg-secondary rounded text-[10px]">WASD</kbd> oder Pfeiltasten
          {' '}— am Handy: virtueller Joystick.
        </p>
      </div>
    </div>
  );
}
