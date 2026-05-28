import { describe, expect, it } from 'vitest';
import { getCardClassName, shouldShowCardLabels } from './cardLayout';

describe('card label layout', () => {
  it('keeps label chrome visible by default behavior', () => {
    expect(shouldShowCardLabels(true)).toBe(true);
    expect(getCardClassName('theme-signal', true)).toBe('social-card theme-signal');
  });

  it('adds the clean-card class when labels are hidden', () => {
    expect(shouldShowCardLabels(false)).toBe(false);
    expect(getCardClassName('theme-signal', false)).toBe('social-card theme-signal card-labels-hidden');
  });
});
