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
      showCardLabels: false,
    });

    expect(JSON.parse(json)).toEqual({
      schema: cardConfigSchema,
      version: cardConfigVersion,
      markdown: '# Launch\n\n- One update',
      presetId: 'xiaohongshu',
      themeId: 'editorial',
      exportScaleId: 'crisp',
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
        showCardLabels: true,
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

