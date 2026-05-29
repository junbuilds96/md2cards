export function splitMarkdownTableCells(line: string): string[] {
  const trimmed = line.trim();

  if (!trimmed.includes('|')) {
    return [];
  }

  return trimmed
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split(/(?<!\\)\|/)
    .map((cell) => cell.trim());
}

export function isMarkdownTableRowLine(line: string): boolean {
  return splitMarkdownTableCells(line).length >= 2;
}

export function isMarkdownTableDelimiterLine(line: string): boolean {
  const cells = splitMarkdownTableCells(line);

  return cells.length >= 2 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

export function isMarkdownTableStart(lines: string[], index: number): boolean {
  const headerLine = lines[index];
  const delimiterLine = lines[index + 1];

  return (
    typeof headerLine === 'string' &&
    typeof delimiterLine === 'string' &&
    isMarkdownTableRowLine(headerLine) &&
    isMarkdownTableDelimiterLine(delimiterLine)
  );
}
