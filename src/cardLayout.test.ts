import { describe, expect, it } from 'vitest';
import { getCardAppearanceStyle, getCardClassName, shouldShowCardLabels } from './cardLayout';

describe('card label layout', () => {
  it('keeps label chrome visible by default behavior', () => {
    expect(shouldShowCardLabels(true)).toBe(true);
    expect(getCardClassName('theme-signal', true, 'balanced', 'default', 'balanced')).toBe(
      'social-card theme-signal density-balanced type-default background-balanced',
    );
  });

  it('adds only the label visibility state when labels are hidden', () => {
    expect(shouldShowCardLabels(false)).toBe(false);
    expect(getCardClassName('theme-signal', false, 'compact', 'large', 'vivid')).toBe(
      'social-card theme-signal density-compact type-large background-vivid card-labels-hidden',
    );
  });

  it('generates accent CSS variables used by preview and image export', () => {
    expect(getCardAppearanceStyle('emerald')).toMatchObject({
      '--card-accent': '#15956b',
      '--card-glow': 'rgba(21, 149, 107, 0.2)',
      '--code-bg': 'rgba(21, 149, 107, 0.14)',
      '--table-rule': 'rgba(21, 149, 107, 0.25)',
    });
  });
});
