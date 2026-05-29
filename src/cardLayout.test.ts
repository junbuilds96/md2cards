import { describe, expect, it } from 'vitest';
import { getCardAppearanceStyle, getCardClassName, shouldShowCardLabels } from './cardLayout';

describe('card label layout', () => {
  it('keeps label chrome visible by default behavior', () => {
    expect(shouldShowCardLabels(true)).toBe(true);
    expect(getCardClassName('theme-signal', true, 'balanced', 'default', 'modern', 'balanced', 'sharp', 'subtle')).toBe(
      'social-card theme-signal density-balanced type-default voice-modern background-balanced radius-sharp texture-subtle',
    );
  });

  it('adds only the label visibility state when labels are hidden', () => {
    expect(shouldShowCardLabels(false)).toBe(false);
    expect(getCardClassName('theme-signal', false, 'compact', 'large', 'editorial', 'vivid', 'rounded', 'clean')).toBe(
      'social-card theme-signal density-compact type-large voice-editorial background-vivid radius-rounded texture-clean card-labels-hidden',
    );
  });

  it('adds the selected texture depth class to exported card markup', () => {
    expect(getCardClassName('theme-paper', true, 'spacious', 'small', 'mono', 'soft', 'subtle', 'rich')).toBe(
      'social-card theme-paper density-spacious type-small voice-mono background-soft radius-subtle texture-rich',
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
