type ProtectedInlineRange = {
  start: number;
  end: number;
};

function getMarkdownLinkEnd(text: string, linkStart: number): number | null {
  const labelStart = text.indexOf('[', linkStart + (text[linkStart] === '!' ? 1 : 0));

  if (labelStart < 0) {
    return null;
  }

  let escaped = false;
  let labelEnd = -1;

  for (let index = labelStart + 1; index < text.length; index += 1) {
    const character = text[index];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (character === '\\') {
      escaped = true;
      continue;
    }

    if (character === ']') {
      labelEnd = index;
      break;
    }
  }

  if (labelEnd < 0 || text[labelEnd + 1] !== '(') {
    return null;
  }

  let depth = 1;
  escaped = false;

  for (let index = labelEnd + 2; index < text.length; index += 1) {
    const character = text[index];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (character === '\\') {
      escaped = true;
      continue;
    }

    if (character === '(') {
      depth += 1;
      continue;
    }

    if (character === ')') {
      depth -= 1;
      if (depth === 0) {
        return index + 1;
      }
    }
  }

  return null;
}

function getMarkdownLinkRanges(text: string): ProtectedInlineRange[] {
  const ranges: ProtectedInlineRange[] = [];

  for (let index = 0; index < text.length; index += 1) {
    const isImageLink = text[index] === '!' && text[index + 1] === '[';
    const isTextLink = text[index] === '[';

    if (!isImageLink && !isTextLink) {
      continue;
    }

    const end = getMarkdownLinkEnd(text, index);

    if (end !== null) {
      ranges.push({ start: index, end });
      index = end - 1;
    }
  }

  return ranges;
}

function getRegexRanges(text: string, patterns: RegExp[]): ProtectedInlineRange[] {
  const ranges: ProtectedInlineRange[] = [];

  for (const pattern of patterns) {
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(text)) !== null) {
      ranges.push({
        start: match.index,
        end: match.index + match[0].length,
      });
    }
  }

  return ranges;
}

export function getInlineSafeCutIndex(text: string, cutIndex: number, maxCutIndex?: number): number {
  const protectedRanges = [
    ...getMarkdownLinkRanges(text),
    ...getRegexRanges(text, [
      /(`+)([\s\S]*?)\1/g,
      /(\*\*|__)(?=\S)([\s\S]*?\S)\1/g,
      /([*_])(?=\S)([\s\S]*?\S)\1/g,
    ]),
  ].sort((a, b) => a.start - b.start);

  for (const range of protectedRanges) {
    if (range.start < cutIndex && cutIndex < range.end) {
      if (range.start > 0) {
        return range.start;
      }

      return maxCutIndex === undefined ? range.end : Math.min(range.end, maxCutIndex);
    }
  }

  return cutIndex;
}
