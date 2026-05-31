// Trainings-Simulator runner. Plays a scenario as a sequence of beats with
// embedded decisions. Maintains score & tags, picks an ending at the end.

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Terminal, RotateCw, ChevronRight } from 'lucide-react';
import { resolveEnding } from '@/lib/scenarios';
import type { Scenario, ScenarioBeat, DecisionOption, ScenarioEnding } from '@/lib/scenarios';

type PlayedBeat = {
  beat: ScenarioBeat;
  /** For decision beats: which option was picked */
  choice?: DecisionOption;
};

type SandboxState =
  | { phase: 'brief' }
  | { phase: 'playing'; index: number; played: PlayedBeat[]; score: number; tags: Set<string>; tokens: number; awaitingDecision: boolean; pendingFollowUp: ScenarioBeat | null }
  | { phase: 'ended'; played: PlayedBeat[]; ending: ScenarioEnding; score: number; tokens: number };

export function SandboxRunner({
  scenario,
  onClose,
}: {
  scenario: Scenario;
  onClose: (completed: boolean) => void;
}) {
  const [state, setState] = useState<SandboxState>({ phase: 'brief' });
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new content
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state]);

  function start() {
    setState({
      phase: 'playing',
      index: 0,
      played: [],
      score: 0,
      tags: new Set(),
      tokens: 0,
      awaitingDecision: scenario.beats[0]?.kind === 'decision',
      pendingFollowUp: null,
    });
    // Auto-advance non-decision beats
    setTimeout(() => autoAdvance(0, [], 0, new Set(), 0), 50);
  }

  function autoAdvance(
    currentIndex: number,
    played: PlayedBeat[],
    score: number,
    tags: Set<string>,
    tokens: number,
  ) {
    // Walk forward through beats until we hit a decision or run out
    let i = currentIndex;
    const newPlayed = [...played];
    let newTokens = tokens;

    while (i < scenario.beats.length) {
      const beat = scenario.beats[i];
      newPlayed.push({ beat });
      if (beat.kind === 'claude' && beat.tokens) {
        newTokens += beat.tokens;
      }
      if (beat.kind === 'decision') {
        // Stop on decision — wait for user
        setState({
          phase: 'playing',
          index: i,
          played: newPlayed,
          score,
          tags,
          tokens: newTokens,
          awaitingDecision: true,
          pendingFollowUp: null,
        });
        return;
      }
      i++;
    }

    // Reached end — pick ending
    const ending = resolveEnding(scenario.endings, score, tags);
    setState({ phase: 'ended', played: newPlayed, ending, score, tokens: newTokens });
  }

  function pickDecision(option: DecisionOption) {
    if (state.phase !== 'playing' || !state.awaitingDecision) return;
    const newTags = new Set(state.tags);
    (option.tags || []).forEach(t => newTags.add(t));
    const newScore = state.score + option.score;

    // Record the choice
    const newPlayed = [...state.played];
    const lastIdx = newPlayed.length - 1;
    if (lastIdx >= 0 && newPlayed[lastIdx].beat.kind === 'decision') {
      newPlayed[lastIdx] = { ...newPlayed[lastIdx], choice: option };
    }

    let newTokens = state.tokens;
    if (option.followUp?.kind === 'claude' && option.followUp.tokens) {
      newTokens += option.followUp.tokens;
    }

    // Inject followUp as a played beat if present
    if (option.followUp) {
      newPlayed.push({ beat: option.followUp });
    }

    // Set state to waiting (not awaiting decision), then advance after a beat
    setState({
      phase: 'playing',
      index: state.index,
      played: newPlayed,
      score: newScore,
      tags: newTags,
      tokens: newTokens,
      awaitingDecision: false,
      pendingFollowUp: null,
    });

    // Continue from next beat after a short pause
    setTimeout(() => {
      autoAdvance(state.index + 1, newPlayed, newScore, newTags, newTokens);
    }, 600);
  }

  function restart() {
    setState({ phase: 'brief' });
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-card rounded-xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-foreground text-background border-b shrink-0">
          <Terminal className="w-5 h-5" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-widest opacity-70">
              Trainings-Simulator · gefakt aber lehrreich
            </p>
            <p className="display-font text-base font-semibold leading-tight truncate">
              {scenario.title}
            </p>
          </div>
          {state.phase === 'playing' && (
            <div className="hidden sm:flex flex-col items-end text-[10px] font-mono opacity-70">
              <div>tokens · {state.tokens.toLocaleString()}</div>
              <div>score · {state.score >= 0 ? '+' : ''}{state.score}</div>
            </div>
          )}
          <button
            onClick={() => onClose(state.phase === 'ended')}
            className="p-1 hover:bg-background/20 rounded transition-colors"
            aria-label="Schließen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Brief phase */}
        {state.phase === 'brief' && (
          <div className="overflow-y-auto flex-1 px-5 py-6">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
              Briefing von {scenario.briefBy}
            </p>
            <h2 className="display-font text-xl font-bold mb-1">{scenario.title}</h2>
            <p className="text-xs text-muted-foreground mb-4">{scenario.subtitle}</p>
            <p className="text-base leading-relaxed mb-5">{scenario.brief}</p>
            <p className="text-xs text-muted-foreground mb-6">
              Geschätzte Spielzeit: ~{scenario.estimatedMin} Minuten · Mehrere Entscheidungspunkte · Outcome je nach Wahl
            </p>
            <Button onClick={start} className="display-font w-full sm:w-auto">
              Simulation starten <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}

        {/* Playing phase */}
        {state.phase === 'playing' && (
          <>
            <div ref={scrollRef} className="overflow-y-auto flex-1 bg-foreground/95 px-4 py-4">
              {state.played.map((p, i) => (
                <BeatRender key={i} beat={p.beat} choice={p.choice} />
              ))}
              {state.awaitingDecision && (
                <DecisionPicker
                  beat={state.played[state.played.length - 1].beat as Extract<ScenarioBeat, { kind: 'decision' }>}
                  onPick={pickDecision}
                />
              )}
            </div>
            {/* Mobile-only token/score footer */}
            <div className="sm:hidden bg-foreground text-background px-4 py-2 text-[10px] font-mono flex justify-between border-t border-background/20">
              <span>tokens · {state.tokens.toLocaleString()}</span>
              <span>score · {state.score >= 0 ? '+' : ''}{state.score}</span>
            </div>
          </>
        )}

        {/* Ended phase */}
        {state.phase === 'ended' && (
          <div className="overflow-y-auto flex-1 px-5 py-6">
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">{state.ending.icon}</div>
              <h2 className="display-font text-2xl font-bold mb-2">{state.ending.title}</h2>
              <div className="text-xs font-mono text-muted-foreground">
                Final · score {state.score >= 0 ? '+' : ''}{state.score} · {state.tokens.toLocaleString()} tokens
              </div>
            </div>
            <p className="text-base leading-relaxed mb-6 italic border-l-2 border-primary/40 pl-4">
              {state.ending.lesson}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
              Dein Pfad
            </p>
            <div className="space-y-1.5 mb-6">
              {state.played
                .filter(p => p.choice)
                .map((p, i) => (
                  <div key={i} className="text-xs flex items-start gap-2">
                    <span className="text-muted-foreground shrink-0">#{i + 1}</span>
                    <span className="flex-1">{p.choice!.label}</span>
                    <span className={`font-mono shrink-0 ${p.choice!.score > 0 ? 'text-green-700' : p.choice!.score < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {p.choice!.score > 0 ? '+' : ''}{p.choice!.score}
                    </span>
                  </div>
                ))}
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button onClick={restart} variant="outline" className="display-font">
                <RotateCw className="w-4 h-4 mr-1" /> Nochmal spielen
              </Button>
              <Button onClick={() => onClose(true)} className="display-font">
                Schließen
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BeatRender({ beat, choice }: { beat: ScenarioBeat; choice?: DecisionOption }) {
  if (beat.kind === 'narration') {
    return (
      <div className="text-background/90 text-sm leading-relaxed mb-3 px-1">
        {beat.text}
      </div>
    );
  }
  if (beat.kind === 'system') {
    const variantClass =
      beat.variant === 'error' ? 'bg-red-900/40 border-red-500/50 text-red-100' :
      beat.variant === 'warn' ? 'bg-yellow-900/30 border-yellow-500/50 text-yellow-100' :
      beat.variant === 'ok' ? 'bg-green-900/30 border-green-500/50 text-green-100' :
      'bg-background/10 border-background/20 text-background/90';
    return (
      <div className={`rounded border-l-2 px-3 py-2 text-[12px] font-mono leading-relaxed mb-3 ${variantClass}`}>
        {beat.text}
      </div>
    );
  }
  if (beat.kind === 'claude') {
    return (
      <div className="font-mono text-[12px] leading-relaxed mb-3 text-green-300/90 space-y-0.5">
        {beat.lines.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap">{line}</div>
        ))}
      </div>
    );
  }
  if (beat.kind === 'decision') {
    if (!choice) return null;
    return (
      <div className="mb-3 space-y-2">
        <div className="text-[11px] uppercase tracking-widest text-background/60 px-1">
          Du wählst:
        </div>
        <div className="bg-primary/20 border border-primary/40 rounded px-3 py-2 text-sm text-background">
          → {choice.label}
        </div>
        <div className="text-sm text-background/80 italic px-1 leading-relaxed">
          {choice.feedback}
        </div>
      </div>
    );
  }
  return null;
}

function DecisionPicker({
  beat,
  onPick,
}: {
  beat: Extract<ScenarioBeat, { kind: 'decision' }>;
  onPick: (option: DecisionOption) => void;
}) {
  return (
    <div className="bg-background/10 border border-background/20 rounded-lg p-3 mt-2 mb-3">
      <div className="text-background font-medium text-sm mb-3 px-1">
        ❓ {beat.prompt}
      </div>
      <div className="space-y-2">
        {beat.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => onPick(opt)}
            className="w-full text-left bg-background hover:bg-primary/10 border-2 border-background/30 hover:border-primary rounded-lg px-3 py-2.5 transition-all group"
          >
            <div className="text-sm font-medium text-foreground group-hover:text-primary">
              {opt.label}
            </div>
            {opt.hint && (
              <div className="text-xs text-muted-foreground mt-0.5">{opt.hint}</div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
