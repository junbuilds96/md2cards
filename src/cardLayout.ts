import {
  getCardAccentOption,
  getCardDensityOption,
  type CardAccentId,
  type CardDensityId,
} from './cardOptions';

export type CardAppearanceStyle = Record<`--${string}`, string>;

export function shouldShowCardLabels(showCardLabels: boolean): boolean {
  return showCardLabels;
}

export function getCardClassName(
  themeClassName: string,
  showCardLabels: boolean,
  cardDensityId: CardDensityId,
): string {
  return [
    'social-card',
    themeClassName,
    getCardDensityOption(cardDensityId).className,
    showCardLabels ? '' : 'card-labels-hidden',
  ]
    .filter(Boolean)
    .join(' ');
}

export function getCardAppearanceStyle(cardAccentId: CardAccentId): CardAppearanceStyle {
  const accent = getCardAccentOption(cardAccentId);

  return {
    '--card-accent': accent.color,
    '--card-glow': accent.glowColor,
    '--code-bg': accent.softColor,
    '--table-rule': accent.faintColor,
  };
}
