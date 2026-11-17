import type { SnippetTarget } from '@joralvmel/cosmos-core';
import { createHighlighterCore } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';

const highlighter = createHighlighterCore({
  themes: [import('shiki/themes/github-light.mjs'), import('shiki/themes/github-dark.mjs')],
  langs: [import('shiki/langs/html.mjs'), import('shiki/langs/tsx.mjs')],
  engine: createJavaScriptRegexEngine(),
});

/** Render tokens as text nodes, never as executable snippet markup. */
export async function highlightCode(
  node: HTMLElement,
  source: string,
  target: SnippetTarget
): Promise<void> {
  const renderer = await highlighter;
  if (node.textContent !== source) return;
  const tokens = renderer.codeToTokensWithThemes(source, {
    lang: target === 'html' ? 'html' : 'tsx',
    themes: { light: 'github-light', dark: 'github-dark' },
  });
  const fragment = document.createDocumentFragment();
  for (const [index, line] of tokens.entries()) {
    if (index > 0) fragment.append(document.createTextNode('\n'));
    for (const token of line) {
      const span = document.createElement('span');
      span.textContent = token.content;
      const light = token.variants.light?.color;
      const dark = token.variants.dark?.color;
      if (light) span.style.setProperty('--code-light', light);
      if (dark) span.style.setProperty('--code-dark', dark);
      fragment.append(span);
    }
  }
  node.replaceChildren(fragment);
}
