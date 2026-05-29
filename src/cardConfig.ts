import {
  cardThemes,
  cardAccentOptions,
  cardBackgroundIntensityOptions,
  cardCompositionOptions,
  cardCornerRadiusOptions,
  cardDensityOptions,
  cardMoodOptions,
  cardShadowOptions,
  cardTextureOptions,
  cardTypographyVoiceOptions,
  cardTypographyScaleOptions,
  defaultCardAccentId,
  defaultCardBackgroundIntensityId,
  defaultCardCompositionId,
  defaultCardCornerRadiusId,
  defaultCardDensityId,
  defaultCardMoodId,
  defaultCardShadowId,
  defaultCardTextureId,
  defaultCardTypographyVoiceId,
  defaultCardTypographyScaleId,
  defaultExportScaleId,
  exportScaleOptions,
  platformPresets,
  type CardAccentId,
  type CardBackgroundIntensityId,
  type CardCompositionId,
  type CardCornerRadiusId,
  type CardDensityId,
  type CardMoodId,
  type CardShadowId,
  type CardTextureId,
  type CardTypographyVoiceId,
  type CardTypographyScaleId,
  type ExportScaleId,
  type PresetId,
  type ThemeId,
} from './cardOptions';

export const cardConfigSchema = 'md2cards.cardConfig';
export const cardConfigVersion = 1;
export const maxCardConfigImportBytes = 1024 * 1024;

export type CardConfig = {
  schema: typeof cardConfigSchema;
  version: typeof cardConfigVersion;
  markdown: string;
  presetId: PresetId;
  themeId: ThemeId;
  exportScaleId: ExportScaleId;
  cardDensityId: CardDensityId;
  cardTypographyScaleId: CardTypographyScaleId;
  cardTypographyVoiceId: CardTypographyVoiceId;
  cardAccentId: CardAccentId;
  cardBackgroundIntensityId: CardBackgroundIntensityId;
  cardCornerRadiusId: CardCornerRadiusId;
  cardCompositionId: CardCompositionId;
  cardTextureId: CardTextureId;
  cardMoodId: CardMoodId;
  cardShadowId: CardShadowId;
  showCardLabels: boolean;
};

export type CardConfigDraft = {
  markdown: string;
  presetId: PresetId;
  themeId: ThemeId;
  exportScaleId: ExportScaleId;
  cardDensityId: CardDensityId;
  cardTypographyScaleId: CardTypographyScaleId;
  cardTypographyVoiceId: CardTypographyVoiceId;
  cardAccentId: CardAccentId;
  cardBackgroundIntensityId: CardBackgroundIntensityId;
  cardCornerRadiusId: CardCornerRadiusId;
  cardCompositionId: CardCompositionId;
  cardTextureId: CardTextureId;
  cardMoodId: CardMoodId;
  cardShadowId: CardShadowId;
  showCardLabels: boolean;
};

export type CardConfigParseResult =
  | {
      valid: true;
      config: CardConfig;
    }
  | {
      valid: false;
      message: string;
    };

export type CardConfigFileValidationResult =
  | {
      valid: true;
    }
  | {
      valid: false;
      message: string;
    };

const validPresetIds = new Set(platformPresets.map((preset) => preset.id));
const validThemeIds = new Set(cardThemes.map((theme) => theme.id));
const validExportScaleIds = new Set(exportScaleOptions.map((option) => option.id));
const validCardDensityIds = new Set(cardDensityOptions.map((option) => option.id));
const validCardTypographyScaleIds = new Set(cardTypographyScaleOptions.map((option) => option.id));
const validCardTypographyVoiceIds = new Set(cardTypographyVoiceOptions.map((option) => option.id));
const validCardAccentIds = new Set(cardAccentOptions.map((option) => option.id));
const validCardBackgroundIntensityIds = new Set(cardBackgroundIntensityOptions.map((option) => option.id));
const validCardCornerRadiusIds = new Set(cardCornerRadiusOptions.map((option) => option.id));
const validCardCompositionIds = new Set(cardCompositionOptions.map((option) => option.id));
const validCardTextureIds = new Set(cardTextureOptions.map((option) => option.id));
const validCardMoodIds = new Set(cardMoodOptions.map((option) => option.id));
const validCardShadowIds = new Set(cardShadowOptions.map((option) => option.id));

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function normalizeMarkdown(markdown: string): string {
  return markdown.replace(/\r\n?/g, '\n');
}

function getFileExtension(fileName: string): string {
  const extensionStart = fileName.lastIndexOf('.');

  if (extensionStart <= 0) {
    return '';
  }

  return fileName.slice(extensionStart).toLowerCase();
}

export function createCardConfig(draft: CardConfigDraft): CardConfig {
  return {
    schema: cardConfigSchema,
    version: cardConfigVersion,
    markdown: normalizeMarkdown(draft.markdown),
    presetId: validPresetIds.has(draft.presetId) ? draft.presetId : platformPresets[0].id,
    themeId: validThemeIds.has(draft.themeId) ? draft.themeId : cardThemes[0].id,
    exportScaleId: validExportScaleIds.has(draft.exportScaleId) ? draft.exportScaleId : defaultExportScaleId,
    cardDensityId: validCardDensityIds.has(draft.cardDensityId) ? draft.cardDensityId : defaultCardDensityId,
    cardTypographyScaleId: validCardTypographyScaleIds.has(draft.cardTypographyScaleId)
      ? draft.cardTypographyScaleId
      : defaultCardTypographyScaleId,
    cardTypographyVoiceId: validCardTypographyVoiceIds.has(draft.cardTypographyVoiceId)
      ? draft.cardTypographyVoiceId
      : defaultCardTypographyVoiceId,
    cardAccentId: validCardAccentIds.has(draft.cardAccentId) ? draft.cardAccentId : defaultCardAccentId,
    cardBackgroundIntensityId: validCardBackgroundIntensityIds.has(draft.cardBackgroundIntensityId)
      ? draft.cardBackgroundIntensityId
      : defaultCardBackgroundIntensityId,
    cardCornerRadiusId: validCardCornerRadiusIds.has(draft.cardCornerRadiusId)
      ? draft.cardCornerRadiusId
      : defaultCardCornerRadiusId,
    cardCompositionId: validCardCompositionIds.has(draft.cardCompositionId)
      ? draft.cardCompositionId
      : defaultCardCompositionId,
    cardTextureId: validCardTextureIds.has(draft.cardTextureId) ? draft.cardTextureId : defaultCardTextureId,
    cardMoodId: validCardMoodIds.has(draft.cardMoodId) ? draft.cardMoodId : defaultCardMoodId,
    cardShadowId: validCardShadowIds.has(draft.cardShadowId) ? draft.cardShadowId : defaultCardShadowId,
    showCardLabels: draft.showCardLabels,
  };
}

export function serializeCardConfig(draft: CardConfigDraft): string {
  return `${JSON.stringify(createCardConfig(draft), null, 2)}\n`;
}

export function parseCardConfigJson(rawJson: string): CardConfigParseResult {
  if (rawJson.length > maxCardConfigImportBytes) {
    return {
      valid: false,
      message: `This recipe is ${formatFileSize(rawJson.length)}. Keep JSON imports under ${formatFileSize(
        maxCardConfigImportBytes,
      )}.`,
    };
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(rawJson);
  } catch {
    return {
      valid: false,
      message: 'This recipe is not valid JSON.',
    };
  }

  if (!isRecord(parsed)) {
    return {
      valid: false,
      message: 'This recipe must be a JSON object.',
    };
  }

  if (parsed.schema !== cardConfigSchema) {
    return {
      valid: false,
      message: 'This JSON file is not an MD2Cards card recipe.',
    };
  }

  if (parsed.version !== cardConfigVersion) {
    return {
      valid: false,
      message: `This recipe version is not supported. Export a fresh recipe from MD2Cards.`,
    };
  }

  if (typeof parsed.markdown !== 'string') {
    return {
      valid: false,
      message: 'This recipe is missing Markdown content.',
    };
  }

  if (!validPresetIds.has(parsed.presetId as PresetId)) {
    return {
      valid: false,
      message: 'This recipe uses an unknown platform preset.',
    };
  }

  if (!validThemeIds.has(parsed.themeId as ThemeId)) {
    return {
      valid: false,
      message: 'This recipe uses an unknown theme.',
    };
  }

  if (!validExportScaleIds.has(parsed.exportScaleId as ExportScaleId)) {
    return {
      valid: false,
      message: 'This recipe uses an unknown export quality.',
    };
  }

  const cardDensityId =
    parsed.cardDensityId === undefined ? defaultCardDensityId : (parsed.cardDensityId as CardDensityId);
  if (!validCardDensityIds.has(cardDensityId)) {
    return {
      valid: false,
      message: 'This recipe uses an unknown density setting.',
    };
  }

  const cardTypographyScaleId =
    parsed.cardTypographyScaleId === undefined
      ? defaultCardTypographyScaleId
      : (parsed.cardTypographyScaleId as CardTypographyScaleId);
  if (!validCardTypographyScaleIds.has(cardTypographyScaleId)) {
    return {
      valid: false,
      message: 'This recipe uses an unknown typography scale.',
    };
  }

  const cardTypographyVoiceId =
    parsed.cardTypographyVoiceId === undefined
      ? defaultCardTypographyVoiceId
      : (parsed.cardTypographyVoiceId as CardTypographyVoiceId);
  if (!validCardTypographyVoiceIds.has(cardTypographyVoiceId)) {
    return {
      valid: false,
      message: 'This recipe uses an unknown typography voice.',
    };
  }

  const cardAccentId =
    parsed.cardAccentId === undefined ? defaultCardAccentId : (parsed.cardAccentId as CardAccentId);
  if (!validCardAccentIds.has(cardAccentId)) {
    return {
      valid: false,
      message: 'This recipe uses an unknown accent color.',
    };
  }

  const cardBackgroundIntensityId =
    parsed.cardBackgroundIntensityId === undefined
      ? defaultCardBackgroundIntensityId
      : (parsed.cardBackgroundIntensityId as CardBackgroundIntensityId);
  if (!validCardBackgroundIntensityIds.has(cardBackgroundIntensityId)) {
    return {
      valid: false,
      message: 'This recipe uses an unknown background intensity.',
    };
  }

  const cardCornerRadiusId =
    parsed.cardCornerRadiusId === undefined
      ? defaultCardCornerRadiusId
      : (parsed.cardCornerRadiusId as CardCornerRadiusId);
  if (!validCardCornerRadiusIds.has(cardCornerRadiusId)) {
    return {
      valid: false,
      message: 'This recipe uses an unknown corner radius.',
    };
  }

  const cardCompositionId =
    parsed.cardCompositionId === undefined
      ? defaultCardCompositionId
      : (parsed.cardCompositionId as CardCompositionId);
  if (!validCardCompositionIds.has(cardCompositionId)) {
    return {
      valid: false,
      message: 'This recipe uses an unknown card composition.',
    };
  }

  const cardTextureId =
    parsed.cardTextureId === undefined ? defaultCardTextureId : (parsed.cardTextureId as CardTextureId);
  if (!validCardTextureIds.has(cardTextureId)) {
    return {
      valid: false,
      message: 'This recipe uses an unknown texture setting.',
    };
  }

  const cardMoodId =
    parsed.cardMoodId === undefined ? defaultCardMoodId : (parsed.cardMoodId as CardMoodId);
  if (!validCardMoodIds.has(cardMoodId)) {
    return {
      valid: false,
      message: 'This recipe uses an unknown mood setting.',
    };
  }

  const cardShadowId =
    parsed.cardShadowId === undefined ? defaultCardShadowId : (parsed.cardShadowId as CardShadowId);
  if (!validCardShadowIds.has(cardShadowId)) {
    return {
      valid: false,
      message: 'This recipe uses an unknown shadow setting.',
    };
  }

  if (typeof parsed.showCardLabels !== 'boolean') {
    return {
      valid: false,
      message: 'This recipe is missing the card label visibility setting.',
    };
  }

  return {
    valid: true,
    config: {
      schema: cardConfigSchema,
      version: cardConfigVersion,
      markdown: normalizeMarkdown(parsed.markdown),
      presetId: parsed.presetId as PresetId,
      themeId: parsed.themeId as ThemeId,
      exportScaleId: parsed.exportScaleId as ExportScaleId,
      cardDensityId,
      cardTypographyScaleId,
      cardTypographyVoiceId,
      cardAccentId,
      cardBackgroundIntensityId,
      cardCornerRadiusId,
      cardCompositionId,
      cardTextureId,
      cardMoodId,
      cardShadowId,
      showCardLabels: parsed.showCardLabels,
    },
  };
}

export function validateCardConfigImportFile(
  file: Pick<File, 'name' | 'size'>,
): CardConfigFileValidationResult {
  if (getFileExtension(file.name) !== '.json') {
    return {
      valid: false,
      message: 'Choose an MD2Cards .json recipe file.',
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      message: 'This recipe file is empty.',
    };
  }

  if (file.size > maxCardConfigImportBytes) {
    return {
      valid: false,
      message: `This recipe file is ${formatFileSize(file.size)}. Keep JSON imports under ${formatFileSize(
        maxCardConfigImportBytes,
      )}.`,
    };
  }

  return {
    valid: true,
  };
}
