import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InfoOverlay } from './InfoOverlay';

describe('<InfoOverlay>', () => {
  it('explains the main screens', () => {
    render(<InfoOverlay onClose={() => {}} />);
    expect(screen.getByText(/Start & Speicherstände/i)).toBeInTheDocument();
    expect(screen.getByText(/Story wählen/i)).toBeInTheDocument();
    expect(screen.getByText(/Räume & Steuerung/i)).toBeInTheDocument();
    expect(screen.getByText(/Trainings-Simulatoren/i)).toBeInTheDocument();
  });

  it('closes via the primary button', async () => {
    const onClose = vi.fn();
    render(<InfoOverlay onClose={onClose} />);
    await userEvent.click(screen.getByRole('button', { name: /Verstanden/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
