import { describe, expect, it } from 'vitest';
import { getCardAppearanceStyle, getCardClassName, shouldShowCardLabels } from './cardLayout';

describe('card label layout', () => {
  it('keeps label chrome visible by default behavior', () => {
    expect(shouldShowCardLabels(true)).toBe(true);
    expect(
      getCardClassName('theme-signal', 'twitter', true, 'balanced', 'default', 'modern', 'balanced', 'sharp', 'subtle', 'calm'),
    ).toBe(
      'social-card preset-twitter theme-signal density-balanced type-default voice-modern background-balanced radius-sharp texture-subtle mood-calm',
    );
  });

  it('adds only the label visibility state when labels are hidden', () => {
    expect(shouldShowCardLabels(false)).toBe(false);
    expect(
      getCardClassName(
        'theme-signal',
        'xiaohongshu',
        false,
        'compact',
        'large',
        'editorial',
        'vivid',
        'rounded',
        'clean',
        'punchy',
      ),
    ).toBe(
      'social-card preset-xiaohongshu theme-signal density-compact type-large voice-editorial background-vivid radius-rounded texture-clean mood-punchy card-labels-hidden',
    );
  });

  it('adds the selected texture depth and mood classes to exported card markup', () => {
    expect(getCardClassName('theme-paper', 'launch', true, 'spacious', 'small', 'mono', 'soft', 'subtle', 'rich', 'premium')).toBe(
      'social-card preset-launch theme-paper density-spacious type-small voice-mono background-soft radius-subtle texture-rich mood-premium',
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
