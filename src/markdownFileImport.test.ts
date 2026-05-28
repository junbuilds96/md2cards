import { describe, expect, it } from 'vitest';
import { maxMarkdownImportBytes, validateMarkdownImportFile } from './markdownFileImport';

function importFile(name: string, size: number): Pick<File, 'name' | 'size'> {
  return { name, size };
}

describe('validateMarkdownImportFile', () => {
  it('accepts Markdown and plain text file extensions', () => {
    expect(validateMarkdownImportFile(importFile('launch.md', 1200))).toEqual({ valid: true });
    expect(validateMarkdownImportFile(importFile('notes.markdown', 1200))).toEqual({ valid: true });
    expect(validateMarkdownImportFile(importFile('draft.TXT', 1200))).toEqual({ valid: true });
  });

  it('rejects unsupported file extensions', () => {
    expect(validateMarkdownImportFile(importFile('screenshot.png', 1200))).toEqual({
      valid: false,
      message: 'Choose a .md, .markdown, or .txt file.',
    });
  });

  it('rejects empty files', () => {
    expect(validateMarkdownImportFile(importFile('empty.md', 0))).toEqual({
      valid: false,
      message: 'This file is empty. Choose a Markdown file with content.',
    });
  });

  it('rejects files over the import size limit', () => {
    expect(validateMarkdownImportFile(importFile('book.md', maxMarkdownImportBytes + 1))).toEqual({
      valid: false,
      message: 'This file is 1.0 MB. Keep imports under 1.0 MB.',
    });
  });
});
