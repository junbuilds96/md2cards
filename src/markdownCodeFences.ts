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
