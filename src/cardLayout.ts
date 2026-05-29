import {
  getCardAccentOption,
  getCardBackgroundIntensityOption,
  getCardCompositionOption,
  getCardCornerRadiusOption,
  getCardDensityOption,
  getCardMoodOption,
  getCardTextureOption,
  getCardTypographyVoiceOption,
  getCardTypographyScaleOption,
  type PresetId,
  type CardAccentId,
  type CardBackgroundIntensityId,
  type CardCompositionId,
  type CardCornerRadiusId,
  type CardDensityId,
  type CardMoodId,
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
  presetId: PresetId,
  showCardLabels: boolean,
  cardDensityId: CardDensityId,
  cardTypographyScaleId: CardTypographyScaleId,
  cardTypographyVoiceId: CardTypographyVoiceId,
  cardBackgroundIntensityId: CardBackgroundIntensityId,
  cardCornerRadiusId: CardCornerRadiusId,
  cardCompositionId: CardCompositionId,
  cardTextureId: CardTextureId,
  cardMoodId: CardMoodId,
): string {
  return [
    'social-card',
    `preset-${presetId}`,
    themeClassName,
    getCardDensityOption(cardDensityId).className,
    getCardTypographyScaleOption(cardTypographyScaleId).className,
    getCardTypographyVoiceOption(cardTypographyVoiceId).className,
    getCardBackgroundIntensityOption(cardBackgroundIntensityId).className,
    getCardCornerRadiusOption(cardCornerRadiusId).className,
    getCardCompositionOption(cardCompositionId).className,
    getCardTextureOption(cardTextureId).className,
    getCardMoodOption(cardMoodId).className,
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
