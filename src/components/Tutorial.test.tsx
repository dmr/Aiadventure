import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tutorial } from './Tutorial';

describe('<Tutorial>', () => {
  it('explains goal and controls', () => {
    render(<Tutorial onClose={() => {}} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Bewegen/i)).toBeInTheDocument();
    expect(screen.getByText(/Ziel/i)).toBeInTheDocument();
  });

  it('calls onClose via the primary button', async () => {
    const onClose = vi.fn();
    render(<Tutorial onClose={onClose} />);
    await userEvent.click(screen.getByRole('button', { name: /Los geht's/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
