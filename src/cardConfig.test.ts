import { describe, expect, it } from 'vitest';
import {
  cardConfigSchema,
  cardConfigVersion,
  maxCardConfigImportBytes,
  parseCardConfigJson,
  serializeCardConfig,
  validateCardConfigImportFile,
} from './cardConfig';

function recipeFile(name: string, size: number): Pick<File, 'name' | 'size'> {
  return { name, size };
}

describe('card config recipes', () => {
  it('serializes the reusable card setup with schema and version metadata', () => {
    const json = serializeCardConfig({
      markdown: '# Launch\r\n\r\n- One update',
      presetId: 'xiaohongshu',
      themeId: 'editorial',
      exportScaleId: 'crisp',
      cardDensityId: 'spacious',
      cardTypographyScaleId: 'large',
      cardTypographyVoiceId: 'editorial',
      cardAccentId: 'rose',
      cardBackgroundIntensityId: 'vivid',
      cardCornerRadiusId: 'rounded',
      cardCompositionId: 'poster',
      cardTextureId: 'rich',
      cardMoodId: 'premium',
      cardShadowId: 'dramatic',
      showCardLabels: false,
    });

    expect(JSON.parse(json)).toEqual({
      schema: cardConfigSchema,
      version: cardConfigVersion,
      markdown: '# Launch\n\n- One update',
      presetId: 'xiaohongshu',
      themeId: 'editorial',
      exportScaleId: 'crisp',
      cardDensityId: 'spacious',
      cardTypographyScaleId: 'large',
      cardTypographyVoiceId: 'editorial',
      cardAccentId: 'rose',
      cardBackgroundIntensityId: 'vivid',
      cardCornerRadiusId: 'rounded',
      cardCompositionId: 'poster',
      cardTextureId: 'rich',
      cardMoodId: 'premium',
      cardShadowId: 'dramatic',
      showCardLabels: false,
    });
    expect(json.endsWith('\n')).toBe(true);
  });

  it('parses a valid exported recipe', () => {
    const result = parseCardConfigJson(
      JSON.stringify({
        schema: cardConfigSchema,
        version: cardConfigVersion,
        markdown: '# Shared\r\nRecipe',
        presetId: 'launch',
        themeId: 'midnight',
        exportScaleId: 'fast',
        cardDensityId: 'compact',
        cardTypographyScaleId: 'small',
        cardTypographyVoiceId: 'mono',
        cardAccentId: 'emerald',
        cardBackgroundIntensityId: 'soft',
        cardCornerRadiusId: 'subtle',
        cardCompositionId: 'code',
        cardTextureId: 'clean',
        cardMoodId: 'punchy',
        cardShadowId: 'flat',
        showCardLabels: true,
      }),
    );

    expect(result).toEqual({
      valid: true,
      config: {
        schema: cardConfigSchema,
        version: cardConfigVersion,
        markdown: '# Shared\nRecipe',
        presetId: 'launch',
        themeId: 'midnight',
        exportScaleId: 'fast',
        cardDensityId: 'compact',
        cardTypographyScaleId: 'small',
        cardTypographyVoiceId: 'mono',
        cardAccentId: 'emerald',
        cardBackgroundIntensityId: 'soft',
        cardCornerRadiusId: 'subtle',
        cardCompositionId: 'code',
        cardTextureId: 'clean',
        cardMoodId: 'punchy',
        cardShadowId: 'flat',
        showCardLabels: true,
      },
    });
  });

  it('defaults appearance when importing an older recipe without those settings', () => {
    const result = parseCardConfigJson(
      JSON.stringify({
        schema: cardConfigSchema,
        version: cardConfigVersion,
        markdown: '# Older recipe',
        presetId: 'twitter',
        themeId: 'signal',
        exportScaleId: 'crisp',
        showCardLabels: true,
      }),
    );

    expect(result).toMatchObject({
      valid: true,
      config: {
        cardDensityId: 'balanced',
        cardTypographyScaleId: 'default',
        cardTypographyVoiceId: 'modern',
        cardAccentId: 'blue',
        cardBackgroundIntensityId: 'balanced',
        cardCornerRadiusId: 'sharp',
        cardCompositionId: 'standard',
        cardTextureId: 'subtle',
        cardMoodId: 'calm',
        cardShadowId: 'lifted',
      },
    });
  });

  it('rejects malformed or unsupported recipes with useful messages', () => {
    expect(parseCardConfigJson('{nope')).toEqual({
      valid: false,
      message: 'This recipe is not valid JSON.',
    });
    expect(parseCardConfigJson(JSON.stringify([]))).toEqual({
      valid: false,
      message: 'This recipe must be a JSON object.',
    });
    expect(parseCardConfigJson(JSON.stringify({ schema: 'other', version: 1 }))).toEqual({
      valid: false,
      message: 'This JSON file is not an MD2Cards card recipe.',
    });
    expect(parseCardConfigJson(JSON.stringify({ schema: cardConfigSchema, version: 99 }))).toEqual({
      valid: false,
      message: 'This recipe version is not supported. Export a fresh recipe from MD2Cards.',
    });
  });

  it('rejects recipes with invalid card option IDs or missing label visibility', () => {
    const baseRecipe = {
      schema: cardConfigSchema,
      version: cardConfigVersion,
      markdown: '# Card',
      presetId: 'twitter',
      themeId: 'signal',
      exportScaleId: 'fast',
      cardDensityId: 'balanced',
      cardTypographyScaleId: 'default',
      cardTypographyVoiceId: 'modern',
      cardAccentId: 'blue',
      cardBackgroundIntensityId: 'balanced',
      cardCornerRadiusId: 'sharp',
      cardCompositionId: 'standard',
      cardTextureId: 'subtle',
      cardMoodId: 'calm',
      cardShadowId: 'lifted',
      showCardLabels: true,
    };

    expect(parseCardConfigJson(JSON.stringify({ ...baseRecipe, presetId: 'missing' }))).toEqual({
      valid: false,
      message: 'This recipe uses an unknown platform preset.',
    });
    expect(parseCardConfigJson(JSON.stringify({ ...baseRecipe, themeId: 'missing' }))).toEqual({
      valid: false,
      message: 'This recipe uses an unknown theme.',
    });
    expect(parseCardConfigJson(JSON.stringify({ ...baseRecipe, exportScaleId: 'missing' }))).toEqual({
      valid: false,
      message: 'This recipe uses an unknown export quality.',
    });
    expect(parseCardConfigJson(JSON.stringify({ ...baseRecipe, cardDensityId: 'missing' }))).toEqual({
      valid: false,
      message: 'This recipe uses an unknown density setting.',
    });
    expect(parseCardConfigJson(JSON.stringify({ ...baseRecipe, cardTypographyScaleId: 'missing' }))).toEqual({
      valid: false,
      message: 'This recipe uses an unknown typography scale.',
    });
    expect(parseCardConfigJson(JSON.stringify({ ...baseRecipe, cardTypographyVoiceId: 'missing' }))).toEqual({
      valid: false,
      message: 'This recipe uses an unknown typography voice.',
    });
    expect(parseCardConfigJson(JSON.stringify({ ...baseRecipe, cardAccentId: 'missing' }))).toEqual({
      valid: false,
      message: 'This recipe uses an unknown accent color.',
    });
    expect(parseCardConfigJson(JSON.stringify({ ...baseRecipe, cardBackgroundIntensityId: 'missing' }))).toEqual({
      valid: false,
      message: 'This recipe uses an unknown background intensity.',
    });
    expect(parseCardConfigJson(JSON.stringify({ ...baseRecipe, cardCornerRadiusId: 'missing' }))).toEqual({
      valid: false,
      message: 'This recipe uses an unknown corner radius.',
    });
    expect(parseCardConfigJson(JSON.stringify({ ...baseRecipe, cardCompositionId: 'missing' }))).toEqual({
      valid: false,
      message: 'This recipe uses an unknown card composition.',
    });
    expect(parseCardConfigJson(JSON.stringify({ ...baseRecipe, cardTextureId: 'missing' }))).toEqual({
      valid: false,
      message: 'This recipe uses an unknown texture setting.',
    });
    expect(parseCardConfigJson(JSON.stringify({ ...baseRecipe, cardMoodId: 'missing' }))).toEqual({
      valid: false,
      message: 'This recipe uses an unknown mood setting.',
    });
    expect(parseCardConfigJson(JSON.stringify({ ...baseRecipe, cardShadowId: 'missing' }))).toEqual({
      valid: false,
      message: 'This recipe uses an unknown shadow setting.',
    });
    expect(parseCardConfigJson(JSON.stringify({ ...baseRecipe, showCardLabels: 'yes' }))).toEqual({
      valid: false,
      message: 'This recipe is missing the card label visibility setting.',
    });
  });

  it('validates JSON recipe files before reading them', () => {
    expect(validateCardConfigImportFile(recipeFile('shared-recipe.json', 1200))).toEqual({ valid: true });
    expect(validateCardConfigImportFile(recipeFile('shared-recipe.txt', 1200))).toEqual({
      valid: false,
      message: 'Choose an MD2Cards .json recipe file.',
    });
    expect(validateCardConfigImportFile(recipeFile('empty.json', 0))).toEqual({
      valid: false,
      message: 'This recipe file is empty.',
    });
    expect(validateCardConfigImportFile(recipeFile('large.json', maxCardConfigImportBytes + 1))).toEqual({
      valid: false,
      message: 'This recipe file is 1.0 MB. Keep JSON imports under 1.0 MB.',
    });
  });
});
