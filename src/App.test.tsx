import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

// Smoke test: App mounts on the title screen and the PWA prompt (stubbed in
// vitest.config) integrates without throwing. Canvas-heavy editor/game screens
// are covered by their own units; jsdom has no real 2D context.
describe('<App>', () => {
  it('renders the title screen by default', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /Reinkommen/i })).toBeInTheDocument();
  });
});
