---
name: gamification
description: >-
  Design game-like motivation into a product so users *want* to finish it —
  clear goals, visible progress, meaningful rewards, feedback loops. Use when a
  learning app / onboarding / tool suffers from "users lose interest", "the goal
  isn't clear", or "no reason to continue", or when adding progress, levels,
  badges, quests, streaks, or a completion/certificate flow.
---

# Gamification that earns engagement (not cheap tricks)

The failure mode is almost always the same: **the player doesn't know what they're
working toward, can't see progress, and gets no payoff.** Fix those three and
motivation follows. Points and badges bolted onto a goalless experience do nothing.

## The G.O.A.L. loop

1. **Goal — make the win obvious and worth wanting.** State the end state in one
   sentence the user sees early ("Master 5 stages + pass a simulator → earn your
   certificate"). A vague "learn about X" is not a goal. A goal has a finish line.
2. **Orientation — always answer "where am I, how much is left?"** A visible
   progress map / "3 of 5" / step tracker. The user should never wonder if they're
   making progress or how close the end is. Uncertainty kills momentum.
3. **Achievement — reward progress with visible, meaningful marks.** Stage
   completions, badges, an unlock, a celebratory moment. Rewards must map to real
   accomplishment (finishing a stage), not busywork. One satisfying payoff at the
   end (certificate / summary of what you mastered) beats scattered confetti.
4. **Loop — tight feedback after every action.** Immediate, specific response:
   "Stage 2 complete ✓ — 3 to go." Each step should tee up the next ("Next:
   the Atelier →") so there's always an obvious next move.

## Motivation levers (use the intrinsic ones first)

- **Competence** — let users feel themselves getting better; show mastery growing.
- **Autonomy** — let them choose order/role/path where possible.
- **Purpose** — tie progress to a real-world payoff they care about.
- **Closure** — humans hate unfinished things; a visible "1 step left" pulls hard.
- **Curiosity gaps** — tease what's behind the next locked stage.
- Extrinsic layers (points/levels/streaks) *amplify* the above; they can't replace it.

## Design rules

- **One primary goal.** Sub-goals ladder up to it. Don't fragment the finish line.
- **Progress must be visible without effort** — persistent, glanceable (HUD chip,
  map). Not buried in a menu.
- **Make the end reachable and celebrated.** A real ending (certificate, recap of
  what was learned, the player's name on it) gives the whole thing a point.
- **Reward completion, not grinding.** Avoid mechanics that pad time.
- **Respect the audience.** For skeptical pros, keep it tasteful — no patronising
  confetti spam; let competence and closure do the work.
- **Persist progress.** Losing progress is the fastest way to lose the player.

## Anti-patterns

- Badges/points with no goal behind them ("pointsification").
- Progress the user can't see → they assume there is none.
- A journey with no ending / no payoff.
- Forced, grindy steps that pad playtime.
- Rewards that don't reflect real accomplishment.

## Quick checklist before shipping a flow

- [ ] Can the user state the goal after 10 seconds?
- [ ] Can they always see how far along they are and what's next?
- [ ] Is there a satisfying, visible payoff at the end?
- [ ] Does every meaningful action get immediate feedback?
- [ ] Is progress saved?
