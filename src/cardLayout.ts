import {
  getCardAccentOption,
  getCardBackgroundIntensityOption,
  getCardCornerRadiusOption,
  getCardDensityOption,
  getCardTextureOption,
  getCardTypographyVoiceOption,
  getCardTypographyScaleOption,
  type CardAccentId,
  type CardBackgroundIntensityId,
  type CardCornerRadiusId,
  type CardDensityId,
  type CardTextureId,
  type CardTypographyVoiceId,
  type CardTypographyScaleId,
} from './cardOptions';

export type CardAppearanceStyle = Record<`--${string}`, string>;

export function shouldShowCardLabels(showCardLabels: boolean): boolean {
  return showCardLabels;
}

export function getCardClassName(
  themeClassName: string,
  showCardLabels: boolean,
  cardDensityId: CardDensityId,
  cardTypographyScaleId: CardTypographyScaleId,
  cardTypographyVoiceId: CardTypographyVoiceId,
  cardBackgroundIntensityId: CardBackgroundIntensityId,
  cardCornerRadiusId: CardCornerRadiusId,
  cardTextureId: CardTextureId,
): string {
  return [
    'social-card',
    themeClassName,
    getCardDensityOption(cardDensityId).className,
    getCardTypographyScaleOption(cardTypographyScaleId).className,
    getCardTypographyVoiceOption(cardTypographyVoiceId).className,
    getCardBackgroundIntensityOption(cardBackgroundIntensityId).className,
    getCardCornerRadiusOption(cardCornerRadiusId).className,
    getCardTextureOption(cardTextureId).className,
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
