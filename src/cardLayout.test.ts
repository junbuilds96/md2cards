import { describe, expect, it } from 'vitest';
import { getCardClassName, shouldShowCardLabels } from './cardLayout';

describe('card label layout', () => {
  it('keeps label chrome visible by default behavior', () => {
    expect(shouldShowCardLabels(true)).toBe(true);
    expect(getCardClassName('theme-signal', true, 'balanced')).toBe('social-card theme-signal density-balanced');
  });

  it('adds the clean-card class when labels are hidden', () => {
    expect(shouldShowCardLabels(false)).toBe(false);
    expect(getCardClassName('theme-signal', false, 'balanced')).toBe(
      'social-card theme-signal density-balanced card-labels-hidden',
    );
  });
});
