import { describe, expect, it } from 'vitest';
import { maxSavedPresets, readSavedPresets, saveSavedPreset, savedPresetsStorageKey, deleteSavedPreset } from './savedPresets';

function createMemoryStorage(initialValue?: unknown): Storage {
  const values = new Map<string, string>();

  if (initialValue !== undefined) {
    values.set(savedPresetsStorageKey, typeof initialValue === 'string' ? initialValue : JSON.stringify(initialValue));
  }

  return {
    get length() {
      return values.size;
    },
    clear() {
      values.clear();
    },
    getItem(key: string) {
      return values.get(key) ?? null;
    },
    key(index: number) {
      return Array.from(values.keys())[index] ?? null;
    },
    removeItem(key: string) {
      values.delete(key);
    },
    setItem(key: string, value: string) {
      values.set(key, value);
    },
  };
}

describe('saved preset storage', () => {
  it('returns an empty list for missing, malformed, or unexpected storage values', () => {
    expect(readSavedPresets(createMemoryStorage())).toEqual([]);
    expect(readSavedPresets(createMemoryStorage('{not json'))).toEqual([]);
    expect(readSavedPresets(createMemoryStorage({ id: 'one' }))).toEqual([]);
  });

  it('filters invalid records and sorts valid presets by latest update', () => {
    const storage = createMemoryStorage([
      {
        id: 'old',
        name: '  Weekly post  ',
        markdown: '# Old\r\n- One',
        presetId: 'twitter',
        themeId: 'signal',
        exportScaleId: 'fast',
        updatedAt: 100,
      },
      {
        id: 'bad-theme',
        name: 'Broken',
        markdown: '# Broken',
        presetId: 'twitter',
        themeId: 'missing',
        exportScaleId: 'fast',
        updatedAt: 300,
      },
      {
        id: 'new',
        name: 'Launch',
        markdown: '# New',
        presetId: 'launch',
        themeId: 'midnight',
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
        showCardLabels: false,
        updatedAt: 200,
      },
    ]);

    expect(readSavedPresets(storage)).toEqual([
      {
        id: 'new',
        name: 'Launch',
        markdown: '# New',
        presetId: 'launch',
        themeId: 'midnight',
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
        showCardLabels: false,
        updatedAt: 200,
      },
      {
        id: 'old',
        name: 'Weekly post',
        markdown: '# Old\n- One',
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
        showCardLabels: true,
        updatedAt: 100,
      },
    ]);
  });

  it('saves a named card setup locally', () => {
    const storage = createMemoryStorage();

    const result = saveSavedPreset(
      {
        name: ' Launch Card ',
        markdown: '# Ship\r\n\r\n- Faster cards',
        presetId: 'xiaohongshu',
        themeId: 'editorial',
        exportScaleId: 'crisp',
        cardDensityId: 'compact',
        cardTypographyScaleId: 'small',
        cardTypographyVoiceId: 'mono',
        cardAccentId: 'amber',
        cardBackgroundIntensityId: 'soft',
        cardCornerRadiusId: 'subtle',
        cardCompositionId: 'framed',
        cardTextureId: 'clean',
        cardMoodId: 'punchy',
        showCardLabels: false,
      },
      storage,
      1234,
    );

    expect(result.created).toBe(true);
    expect(result.preset).toMatchObject({
      id: 'preset-1234-launch-card',
      name: 'Launch Card',
      markdown: '# Ship\n\n- Faster cards',
      presetId: 'xiaohongshu',
      themeId: 'editorial',
      exportScaleId: 'crisp',
      cardDensityId: 'compact',
      cardTypographyScaleId: 'small',
      cardTypographyVoiceId: 'mono',
      cardAccentId: 'amber',
      cardBackgroundIntensityId: 'soft',
      cardCornerRadiusId: 'subtle',
      cardCompositionId: 'framed',
      cardTextureId: 'clean',
      cardMoodId: 'punchy',
      showCardLabels: false,
      updatedAt: 1234,
    });
    expect(readSavedPresets(storage)).toEqual([result.preset]);
  });

  it('updates an existing preset when saving the same name again', () => {
    const storage = createMemoryStorage();

    const first = saveSavedPreset(
      {
        name: 'Team Update',
        markdown: '# Old',
        presetId: 'twitter',
        themeId: 'signal',
        exportScaleId: 'fast',
        cardDensityId: 'balanced',
        cardTypographyScaleId: 'default',
        cardTypographyVoiceId: 'modern',
        cardAccentId: 'blue',
        cardBackgroundIntensityId: 'balanced',
        cardCornerRadiusId: 'sharp',
        cardTextureId: 'subtle',
      },
      storage,
      100,
    );
    const second = saveSavedPreset(
      {
        name: ' team update ',
        markdown: '# New',
        presetId: 'launch',
        themeId: 'midnight',
        exportScaleId: 'crisp',
        cardDensityId: 'spacious',
        cardTypographyScaleId: 'large',
        cardTypographyVoiceId: 'editorial',
        cardAccentId: 'emerald',
        cardBackgroundIntensityId: 'vivid',
        cardCornerRadiusId: 'rounded',
        cardCompositionId: 'poster',
        cardTextureId: 'rich',
        cardMoodId: 'premium',
        showCardLabels: false,
      },
      storage,
      200,
    );

    expect(second.created).toBe(false);
    expect(second.preset.id).toBe(first.preset.id);
    expect(readSavedPresets(storage)).toEqual([
      {
        id: first.preset.id,
        name: 'team update',
        markdown: '# New',
        presetId: 'launch',
        themeId: 'midnight',
        exportScaleId: 'crisp',
        cardDensityId: 'spacious',
        cardTypographyScaleId: 'large',
        cardTypographyVoiceId: 'editorial',
        cardAccentId: 'emerald',
        cardBackgroundIntensityId: 'vivid',
        cardCornerRadiusId: 'rounded',
        cardCompositionId: 'poster',
        cardTextureId: 'rich',
        cardMoodId: 'premium',
        showCardLabels: false,
        updatedAt: 200,
      },
    ]);
  });

  it('keeps only the newest preset limit and deletes by id', () => {
    const storage = createMemoryStorage();

    for (let index = 0; index < maxSavedPresets + 2; index += 1) {
      saveSavedPreset(
        {
          name: `Preset ${index}`,
          markdown: `# Preset ${index}`,
          presetId: 'twitter',
          themeId: 'signal',
          exportScaleId: 'fast',
          cardDensityId: 'balanced',
          cardTypographyScaleId: 'default',
          cardTypographyVoiceId: 'modern',
          cardAccentId: 'blue',
          cardBackgroundIntensityId: 'balanced',
          cardCornerRadiusId: 'sharp',
          cardTextureId: 'subtle',
        },
        storage,
        index,
      );
    }

    const presets = readSavedPresets(storage);
    expect(presets).toHaveLength(maxSavedPresets);
    expect(presets[0].name).toBe(`Preset ${maxSavedPresets + 1}`);
    expect(presets[presets.length - 1].name).toBe('Preset 2');

    const afterDelete = deleteSavedPreset(presets[0].id, storage);
    expect(afterDelete).toHaveLength(maxSavedPresets - 1);
    expect(afterDelete.some((preset) => preset.id === presets[0].id)).toBe(false);
  });

  it('requires a non-blank preset name', () => {
    expect(() =>
      saveSavedPreset(
        {
          name: '   ',
          markdown: '# No name',
          presetId: 'twitter',
          themeId: 'signal',
          exportScaleId: 'fast',
          cardDensityId: 'balanced',
          cardTypographyScaleId: 'default',
          cardTypographyVoiceId: 'modern',
          cardAccentId: 'blue',
          cardBackgroundIntensityId: 'balanced',
          cardCornerRadiusId: 'sharp',
          cardTextureId: 'subtle',
        },
        createMemoryStorage(),
        1,
      ),
    ).toThrow('Name this preset before saving.');
  });
});
