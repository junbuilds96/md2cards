export function splitMarkdownTableCells(line: string): string[] {
  const trimmed = line.trim();

  if (!trimmed.includes('|')) {
    return [];
  }

  const cells: string[] = [];
  let currentCell = '';
  let escaped = false;
  let codeSpanTicks = 0;

  for (let index = 0; index < trimmed.length; index += 1) {
    const character = trimmed[index];

    if (escaped) {
      currentCell += character;
      escaped = false;
      continue;
    }

    if (character === '\\') {
      currentCell += character;
      escaped = true;
      continue;
    }

    if (character === '`') {
      const tickStart = index;

      while (trimmed[index + 1] === '`') {
        index += 1;
      }

      const tickRunLength = index - tickStart + 1;
      currentCell += '`'.repeat(tickRunLength);

      if (codeSpanTicks === 0) {
        codeSpanTicks = tickRunLength;
      } else if (tickRunLength === codeSpanTicks) {
        codeSpanTicks = 0;
      }

      continue;
    }

    if (character === '|' && codeSpanTicks === 0) {
      cells.push(currentCell.trim());
      currentCell = '';
      continue;
    }

    currentCell += character;
  }

  cells.push(currentCell.trim());

  if (cells[0] === '') {
    cells.shift();
  }

  if (cells[cells.length - 1] === '') {
    cells.pop();
  }

  return cells;
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
