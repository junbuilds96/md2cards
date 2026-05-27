import { describe, expect, it } from 'vitest';
import { platformPresets } from './cardOptions';
import { getExportFileName } from './exportImage';

describe('getExportFileName', () => {
  it('creates a stable social-card filename from a markdown title', () => {
    expect(getExportFileName(platformPresets[0], '# Launch: MD2Cards v0.1!')).toBe(
      'launch-md2cards-v0-1-twitter.png',
    );
  });

  it('falls back when the title has no usable characters', () => {
    expect(getExportFileName(platformPresets[2], '### ✨')).toBe('md2cards-launch.png');
  });
});
