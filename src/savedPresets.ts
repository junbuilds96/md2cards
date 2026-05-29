import {
  cardThemes,
  cardAccentOptions,
  cardBackgroundIntensityOptions,
  cardCornerRadiusOptions,
  cardDensityOptions,
  cardTextureOptions,
  cardTypographyScaleOptions,
  defaultCardAccentId,
  defaultCardBackgroundIntensityId,
  defaultCardCornerRadiusId,
  defaultCardDensityId,
  defaultCardTextureId,
  defaultCardTypographyScaleId,
  defaultExportScaleId,
  exportScaleOptions,
  platformPresets,
  type CardAccentId,
  type CardBackgroundIntensityId,
  type CardCornerRadiusId,
  type CardDensityId,
  type CardTextureId,
  type CardTypographyScaleId,
  type ExportScaleId,
  type PresetId,
  type ThemeId,
} from './cardOptions';

export const savedPresetsStorageKey = 'md2cards.savedPresets.v1';
export const maxSavedPresets = 20;

export type SavedCardPreset = {
  id: string;
  name: string;
  markdown: string;
  presetId: PresetId;
  themeId: ThemeId;
  exportScaleId: ExportScaleId;
  cardDensityId: CardDensityId;
  cardTypographyScaleId: CardTypographyScaleId;
  cardAccentId: CardAccentId;
  cardBackgroundIntensityId: CardBackgroundIntensityId;
  cardCornerRadiusId: CardCornerRadiusId;
  cardTextureId: CardTextureId;
  showCardLabels: boolean;
  updatedAt: number;
};

export type SavedCardPresetDraft = {
  name: string;
  markdown: string;
  presetId: PresetId;
  themeId: ThemeId;
  exportScaleId: ExportScaleId;
  cardDensityId: CardDensityId;
  cardTypographyScaleId: CardTypographyScaleId;
  cardAccentId: CardAccentId;
  cardBackgroundIntensityId: CardBackgroundIntensityId;
  cardCornerRadiusId: CardCornerRadiusId;
  cardTextureId: CardTextureId;
  showCardLabels?: boolean;
};

export type SaveSavedPresetResult = {
  preset: SavedCardPreset;
  presets: SavedCardPreset[];
  created: boolean;
};

type PresetStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

const validPresetIds = new Set(platformPresets.map((preset) => preset.id));
const validThemeIds = new Set(cardThemes.map((theme) => theme.id));
const validExportScaleIds = new Set(exportScaleOptions.map((option) => option.id));
const validCardDensityIds = new Set(cardDensityOptions.map((option) => option.id));
const validCardTypographyScaleIds = new Set(cardTypographyScaleOptions.map((option) => option.id));
const validCardAccentIds = new Set(cardAccentOptions.map((option) => option.id));
const validCardBackgroundIntensityIds = new Set(cardBackgroundIntensityOptions.map((option) => option.id));
const validCardCornerRadiusIds = new Set(cardCornerRadiusOptions.map((option) => option.id));
const validCardTextureIds = new Set(cardTextureOptions.map((option) => option.id));

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function normalizeName(name: string): string {
  return name.replace(/\s+/g, ' ').trim().slice(0, 60);
}

function normalizeMarkdown(markdown: string): string {
  return markdown.replace(/\r\n?/g, '\n');
}

function createPresetId(name: string, updatedAt: number): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 36);

  return `preset-${updatedAt}-${slug || 'card'}`;
}

function parseSavedPreset(value: unknown): SavedCardPreset | null {
  if (!isRecord(value)) {
    return null;
  }

  const name = typeof value.name === 'string' ? normalizeName(value.name) : '';
  const markdown = typeof value.markdown === 'string' ? normalizeMarkdown(value.markdown) : '';
  const presetId = value.presetId;
  const themeId = value.themeId;
  const exportScaleId = value.exportScaleId;
  const cardDensityId = value.cardDensityId === undefined ? defaultCardDensityId : value.cardDensityId;
  const cardTypographyScaleId =
    value.cardTypographyScaleId === undefined ? defaultCardTypographyScaleId : value.cardTypographyScaleId;
  const cardAccentId = value.cardAccentId === undefined ? defaultCardAccentId : value.cardAccentId;
  const cardBackgroundIntensityId =
    value.cardBackgroundIntensityId === undefined
      ? defaultCardBackgroundIntensityId
      : value.cardBackgroundIntensityId;
  const cardCornerRadiusId =
    value.cardCornerRadiusId === undefined ? defaultCardCornerRadiusId : value.cardCornerRadiusId;
  const cardTextureId = value.cardTextureId === undefined ? defaultCardTextureId : value.cardTextureId;
  const showCardLabels = value.showCardLabels === undefined ? true : value.showCardLabels;
  const updatedAt = typeof value.updatedAt === 'number' && Number.isFinite(value.updatedAt) ? value.updatedAt : 0;

  if (
    typeof value.id !== 'string' ||
    value.id.trim().length === 0 ||
    name.length === 0 ||
    !validPresetIds.has(presetId as PresetId) ||
    !validThemeIds.has(themeId as ThemeId) ||
    !validExportScaleIds.has(exportScaleId as ExportScaleId) ||
    !validCardDensityIds.has(cardDensityId as CardDensityId) ||
    !validCardTypographyScaleIds.has(cardTypographyScaleId as CardTypographyScaleId) ||
    !validCardAccentIds.has(cardAccentId as CardAccentId) ||
    !validCardBackgroundIntensityIds.has(cardBackgroundIntensityId as CardBackgroundIntensityId) ||
    !validCardCornerRadiusIds.has(cardCornerRadiusId as CardCornerRadiusId) ||
    !validCardTextureIds.has(cardTextureId as CardTextureId) ||
    typeof showCardLabels !== 'boolean'
  ) {
    return null;
  }

  return {
    id: value.id,
    name,
    markdown,
    presetId: presetId as PresetId,
    themeId: themeId as ThemeId,
    exportScaleId: exportScaleId as ExportScaleId,
    cardDensityId: cardDensityId as CardDensityId,
    cardTypographyScaleId: cardTypographyScaleId as CardTypographyScaleId,
    cardAccentId: cardAccentId as CardAccentId,
    cardBackgroundIntensityId: cardBackgroundIntensityId as CardBackgroundIntensityId,
    cardCornerRadiusId: cardCornerRadiusId as CardCornerRadiusId,
    cardTextureId: cardTextureId as CardTextureId,
    showCardLabels,
    updatedAt,
  };
}

function sortPresets(presets: SavedCardPreset[]): SavedCardPreset[] {
  return [...presets].sort((a, b) => b.updatedAt - a.updatedAt || a.name.localeCompare(b.name));
}

function getLocalStorage(): PresetStorage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

export function readSavedPresets(storage: PresetStorage | null = getLocalStorage()): SavedCardPreset[] {
  if (!storage) {
    return [];
  }

  try {
    const raw = storage.getItem(savedPresetsStorageKey);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return sortPresets(parsed.map(parseSavedPreset).filter((preset): preset is SavedCardPreset => Boolean(preset)));
  } catch {
    return [];
  }
}

export function writeSavedPresets(
  presets: SavedCardPreset[],
  storage: PresetStorage | null = getLocalStorage(),
): void {
  if (!storage) {
    return;
  }

  const validPresets = sortPresets(
    presets.map(parseSavedPreset).filter((preset): preset is SavedCardPreset => Boolean(preset)),
  ).slice(0, maxSavedPresets);

  try {
    if (validPresets.length === 0) {
      storage.removeItem(savedPresetsStorageKey);
      return;
    }

    storage.setItem(savedPresetsStorageKey, JSON.stringify(validPresets));
  } catch {
    // Storage can fail in private browsing or when the quota is full. Keep the editor usable.
  }
}

export function saveSavedPreset(
  draft: SavedCardPresetDraft,
  storage: PresetStorage | null = getLocalStorage(),
  updatedAt = Date.now(),
): SaveSavedPresetResult {
  const name = normalizeName(draft.name);

  if (name.length === 0) {
    throw new Error('Name this preset before saving.');
  }

  const existingPresets = readSavedPresets(storage);
  const existing = existingPresets.find((preset) => preset.name.toLowerCase() === name.toLowerCase());
  const preset: SavedCardPreset = {
    id: existing?.id ?? createPresetId(name, updatedAt),
    name,
    markdown: normalizeMarkdown(draft.markdown),
    presetId: validPresetIds.has(draft.presetId) ? draft.presetId : platformPresets[0].id,
    themeId: validThemeIds.has(draft.themeId) ? draft.themeId : cardThemes[0].id,
    exportScaleId: validExportScaleIds.has(draft.exportScaleId) ? draft.exportScaleId : defaultExportScaleId,
    cardDensityId: validCardDensityIds.has(draft.cardDensityId) ? draft.cardDensityId : defaultCardDensityId,
    cardTypographyScaleId: validCardTypographyScaleIds.has(draft.cardTypographyScaleId)
      ? draft.cardTypographyScaleId
      : defaultCardTypographyScaleId,
    cardAccentId: validCardAccentIds.has(draft.cardAccentId) ? draft.cardAccentId : defaultCardAccentId,
    cardBackgroundIntensityId: validCardBackgroundIntensityIds.has(draft.cardBackgroundIntensityId)
      ? draft.cardBackgroundIntensityId
      : defaultCardBackgroundIntensityId,
    cardCornerRadiusId: validCardCornerRadiusIds.has(draft.cardCornerRadiusId)
      ? draft.cardCornerRadiusId
      : defaultCardCornerRadiusId,
    cardTextureId: validCardTextureIds.has(draft.cardTextureId) ? draft.cardTextureId : defaultCardTextureId,
    showCardLabels: typeof draft.showCardLabels === 'boolean' ? draft.showCardLabels : true,
    updatedAt,
  };

  const presets = sortPresets([
    preset,
    ...existingPresets.filter((item) => item.id !== preset.id),
  ]).slice(0, maxSavedPresets);

  writeSavedPresets(presets, storage);

  return {
    preset,
    presets,
    created: !existing,
  };
}

export function deleteSavedPreset(
  presetId: string,
  storage: PresetStorage | null = getLocalStorage(),
): SavedCardPreset[] {
  const presets = readSavedPresets(storage).filter((preset) => preset.id !== presetId);
  writeSavedPresets(presets, storage);
  return presets;
}
