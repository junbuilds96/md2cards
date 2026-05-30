export function getMarkdownCodeFenceMarker(line: string): string | null {
  const match = line.trim().match(/^(`{3,}|~{3,})/);

  return match?.[1] ?? null;
}

export function isMarkdownCodeFenceLine(line: string): boolean {
  return getMarkdownCodeFenceMarker(line) !== null;
}

export function isMarkdownCodeFenceClose(line: string, openingMarker: string): boolean {
  const marker = getMarkdownCodeFenceMarker(line);

  return marker !== null && marker[0] === openingMarker[0] && marker.length >= openingMarker.length;
}

export function normalizeMarkdownCodeFenceBlock(
  lines: string[],
  codeLineLimit: number,
  codeLineCharacterLimit?: number,
): { markdown: string; truncated: boolean; closedFence: boolean; shortenedLines: boolean } {
  const openingMarker = getMarkdownCodeFenceMarker(lines[0] ?? '') ?? '```';
  const firstLine = getMarkdownCodeFenceMarker(lines[0] ?? '') ? lines[0] : openingMarker;
  const hasClosingFence = lines.length > 1 && isMarkdownCodeFenceClose(lines[lines.length - 1] ?? '', openingMarker);
  const codeLines = hasClosingFence ? lines.slice(1, -1) : lines.slice(getMarkdownCodeFenceMarker(lines[0] ?? '') ? 1 : 0);
  let shortenedLines = false;
  const keptCodeLines = codeLines.slice(0, codeLineLimit).map((line) => {
    if (!codeLineCharacterLimit || line.length <= codeLineCharacterLimit) {
      return line;
    }

    shortenedLines = true;
    return `${line.slice(0, Math.max(0, codeLineCharacterLimit - 3)).trimEnd()}...`;
  });
  const lastLine = hasClosingFence ? (lines[lines.length - 1] ?? openingMarker) : openingMarker;

  return {
    markdown: [firstLine, ...keptCodeLines, lastLine].join('\n'),
    truncated: codeLines.length > keptCodeLines.length,
    closedFence: !hasClosingFence,
    shortenedLines,
  };
}
