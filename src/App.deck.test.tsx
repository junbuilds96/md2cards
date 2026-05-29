// @vitest-environment jsdom

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import App from './App';

const deckMarkdown = [
  '# Product memo',
  '',
  'This memo is long enough to need more than one card. It explains the source problem, the product response, and the publishing path in enough detail that a single social card would become crowded.',
  '',
  '## Problem',
  '',
  'A long memo pasted into one card makes the output hard to read. The editor should keep the source and build a deck preview instead.',
  '',
  '## Product path',
  '',
  '- Keep source markdown intact',
  '- Split cards deterministically',
  '- Preview the current card',
  '- Export every card',
  '- Generate caption text',
  '',
  '## Result',
  '',
  'Creators get a reversible workflow for turning long notes into multiple platform-safe cards.',
].join('\n');

function setTextareaValue(textarea: HTMLTextAreaElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;
  setter?.call(textarea, value);
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
}

describe('App deck workflow', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('splits markdown into a navigable deck with a caption and clears it after editing', () => {
    act(() => {
      root.render(<App />);
    });

    const textarea = container.querySelector('textarea');
    expect(textarea).toBeInstanceOf(HTMLTextAreaElement);

    act(() => {
      setTextareaValue(textarea!, deckMarkdown);
    });

    act(() => {
      container.querySelector<HTMLButtonElement>('button[aria-label="Split into deck"]')?.click();
    });

    expect(container.textContent).toMatch(/Card 1\/\d+/);
    expect(container.textContent).toContain('Caption / thread');

    act(() => {
      container.querySelector<HTMLButtonElement>('button[aria-label="Next card"]')?.click();
    });

    expect(container.textContent).toMatch(/Card 2\/\d+/);

    act(() => {
      container.querySelector<HTMLButtonElement>('button[aria-label="Previous card"]')?.click();
    });

    expect(container.textContent).toMatch(/Card 1\/\d+/);

    act(() => {
      setTextareaValue(textarea!, `${deckMarkdown}\n\nEdited source.`);
    });

    expect(container.textContent).not.toMatch(/Card 1\/\d+/);
    expect(container.textContent).not.toContain('Caption / thread');
  });
});
