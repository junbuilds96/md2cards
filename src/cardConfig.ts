import {
  cardThemes,
  defaultExportScaleId,
  exportScaleOptions,
  platformPresets,
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
  showCardLabels: boolean;
};

export type CardConfigDraft = {
  markdown: string;
  presetId: PresetId;
  themeId: ThemeId;
  exportScaleId: ExportScaleId;
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

