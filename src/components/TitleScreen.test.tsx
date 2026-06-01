import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TitleScreen } from './TitleScreen';

describe('<TitleScreen>', () => {
  it('renders the title and entry button', () => {
    render(<TitleScreen onStart={() => {}} />);
    expect(screen.getByRole('heading')).toHaveTextContent(/Vibe/i);
    expect(screen.getByRole('button', { name: /Reinkommen/i })).toBeInTheDocument();
  });

  it('calls onStart when the entry button is clicked', async () => {
    const onStart = vi.fn();
    render(<TitleScreen onStart={onStart} />);
    await userEvent.click(screen.getByRole('button', { name: /Reinkommen/i }));
    expect(onStart).toHaveBeenCalledOnce();
  });
});
