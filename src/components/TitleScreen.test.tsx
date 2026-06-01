import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TitleScreen } from './TitleScreen';
import type { Session } from '@/lib/sessions';
import { DEFAULT_AVATAR } from '@/lib/avatar';

function makeSession(over: Partial<Session> = {}): Session {
  const now = Date.now();
  return {
    id: 's1',
    name: 'Sir Refactor',
    avatar: DEFAULT_AVATAR,
    completedLessons: [],
    misc: [],
    createdAt: now,
    lastPlayedAt: now,
    playtimeMs: 0,
    visits: 1,
    avatarChanges: 0,
    ...over,
  };
}

describe('<TitleScreen>', () => {
  it('first-time: shows the title and entry button', () => {
    render(<TitleScreen sessions={[]} onContinue={() => {}} onNewSession={() => {}} />);
    expect(screen.getByRole('heading')).toHaveTextContent(/Vibe/i);
    expect(screen.getByRole('button', { name: /Reinkommen/i })).toBeInTheDocument();
  });

  it('first-time: entry button starts a new session', async () => {
    const onNewSession = vi.fn();
    render(<TitleScreen sessions={[]} onContinue={() => {}} onNewSession={onNewSession} />);
    await userEvent.click(screen.getByRole('button', { name: /Reinkommen/i }));
    expect(onNewSession).toHaveBeenCalledOnce();
  });

  it('returning: lists save slots and resumes the chosen one', async () => {
    const onContinue = vi.fn();
    render(
      <TitleScreen
        sessions={[makeSession({ id: 'abc', name: 'Lady Lambda' })]}
        onContinue={onContinue}
        onNewSession={() => {}}
      />,
    );
    const slot = screen.getByRole('button', { name: /Lady Lambda/i });
    await userEvent.click(slot);
    expect(onContinue).toHaveBeenCalledWith('abc');
    expect(screen.getByRole('button', { name: /Neue Session/i })).toBeInTheDocument();
  });
});
