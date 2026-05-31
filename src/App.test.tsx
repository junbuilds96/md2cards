import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getCodeLanguageLabel, markdownComponents } from './App';

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

describe('markdownComponents', () => {
  it('renders fenced code blocks with editor chrome and language labels', () => {
    const html = renderToStaticMarkup(
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {'```tsx\nconst card = "ready";\n```'}
      </ReactMarkdown>,
    );

    expect(html).toContain('class="markdown-code-frame"');
    expect(html).toContain('class="markdown-code-header"');
    expect(html).toContain('class="markdown-code-window-dots"');
    expect(html).toContain('class="markdown-code-language">TSX</span>');
    expect(html).toContain('class="markdown-code-pre"');
    expect(html).toContain('class="markdown-code-text language-tsx"');
    expect(html).toContain('data-language="TSX"');
    expect(html).toContain('const card = &quot;ready&quot;');
  });

  it('renders inline code with the same language-safe code text class', () => {
    const html = renderToStaticMarkup(
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {'Use `npm run build` before exporting.'}
      </ReactMarkdown>,
    );

    expect(html).toContain('class="markdown-code-text"');
    expect(html).toContain('data-language="CODE"');
    expect(html).toContain('npm run build');
  });

  it('renders Markdown images with the card image class and preserves alt text', () => {
    const html = renderToStaticMarkup(
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {'![Launch screenshot](https://cdn.example.com/md2cards/launch.png)'}
      </ReactMarkdown>,
    );

    expect(html).toContain('class="markdown-card-image"');
    expect(html).toContain('alt="Launch screenshot"');
    expect(html).toContain('src="https://cdn.example.com/md2cards/launch.png"');
  });
});
