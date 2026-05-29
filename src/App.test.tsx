import { describe, expect, it } from 'vitest';
import { getCodeLanguageLabel } from './App';

describe('getCodeLanguageLabel', () => {
  it('extracts uppercase labels from ReactMarkdown language classes', () => {
    expect(getCodeLanguageLabel('language-ts')).toBe('TS');
    expect(getCodeLanguageLabel('highlight language-objective-c')).toBe('OBJECTIVE-C');
    expect(getCodeLanguageLabel('language-cpp meta')).toBe('CPP');
  });

  it('falls back to a neutral code label when no language is present', () => {
    expect(getCodeLanguageLabel()).toBe('CODE');
    expect(getCodeLanguageLabel('')).toBe('CODE');
    expect(getCodeLanguageLabel('token keyword')).toBe('CODE');
  });
});
