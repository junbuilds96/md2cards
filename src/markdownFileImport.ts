export const maxMarkdownImportBytes = 1024 * 1024;

const allowedMarkdownImportExtensions = new Set(['.md', '.markdown', '.txt']);

export type MarkdownImportValidationResult =
  | {
      valid: true;
    }
  | {
      valid: false;
      message: string;
    };

function getFileExtension(fileName: string): string {
  const extensionStart = fileName.lastIndexOf('.');

  if (extensionStart <= 0) {
    return '';
  }

  return fileName.slice(extensionStart).toLowerCase();
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

export function validateMarkdownImportFile(
  file: Pick<File, 'name' | 'size'>,
): MarkdownImportValidationResult {
  const extension = getFileExtension(file.name);

  if (!allowedMarkdownImportExtensions.has(extension)) {
    return {
      valid: false,
      message: 'Choose a .md, .markdown, or .txt file.',
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      message: 'This file is empty. Choose a Markdown file with content.',
    };
  }

  if (file.size > maxMarkdownImportBytes) {
    return {
      valid: false,
      message: `This file is ${formatFileSize(file.size)}. Keep imports under ${formatFileSize(
        maxMarkdownImportBytes,
      )}.`,
    };
  }

  return {
    valid: true,
  };
}
