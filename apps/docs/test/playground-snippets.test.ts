import {
  buttonContract,
  generateSnippets,
  iconButtonContract,
  iconContract,
} from '@joralvmel/cosmos-core';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import { playgroundSnippets } from '../src/lib/playground-snippets';

describe('composed playground snippets', () => {
  const snippets = playgroundSnippets(
    iconButtonContract,
    { label: 'Favorite', mode: 'toggle', pressed: true, type: 'submit' },
    '',
    { contract: iconContract, values: { icon: 'heart' } }
  );

  it('leaves existing text-content examples unchanged', () => {
    expect(playgroundSnippets(buttonContract, {}, 'Save')).toEqual(
      generateSnippets(buttonContract, {}, 'Save')
    );
  });

  it('keeps icon imports, default-slot children, events and platform-specific props', () => {
    for (const [platform, source] of Object.entries(snippets)) {
      expect(source).toContain("from '@joralvmel/cosmos-icons/heart'");
      expect(source).not.toContain('COSMOS_PLAYGROUND_CHILD');
      expect(source).not.toContain('&lt;cosm-icon');
      expect(source).toContain('label="Favorite"');
      if (platform === 'html' || platform === 'angular') {
        expect(source).toMatch(/<cosm-icon(?: |>)/);
        expect(source).toContain('</cosm-icon></cosm-icon-button>');
      } else {
        expect(source).toContain('<Icon icon={heart}></Icon>');
        expect(source).toMatch(/import \{ IconButton, Icon \}/);
        expect(source).toContain('onPressedChange=');
      }
      expect(source.includes('type="submit"')).toBe(platform !== 'native');
    }
    expect(snippets.html).toContain("import '@joralvmel/cosmos-elements/icon';");
    expect(snippets.html).toContain("const childElement = document.querySelector('cosm-icon');");
    expect(snippets.html).toContain('childElement.icon = heart;');
    expect(snippets.angular).toContain('imports: [CosmIconButtonComponent, CosmIconComponent]');
    expect(snippets.angular).toContain('readonly heart = heart;');
    expect(snippets.angular).toContain('[icon]="heart"');
    expect(snippets.react).toContain('event.detail');
    expect(snippets.native).toContain('detail =>');
  });

  it('emits syntactically valid TypeScript/TSX, Angular setup and browser JavaScript', () => {
    for (const [platform, source] of Object.entries(snippets)) {
      const input =
        platform === 'html'
          ? (/<script type="module">([\s\S]*)<\/script>/.exec(source)?.[1] ?? '')
          : source;
      expect(input).not.toBe('');
      const result = ts.transpileModule(input, {
        fileName: platform === 'react' || platform === 'native' ? 'example.tsx' : 'example.ts',
        compilerOptions: {
          target: ts.ScriptTarget.ESNext,
          module: ts.ModuleKind.ESNext,
          jsx: ts.JsxEmit.ReactJSX,
          experimentalDecorators: true,
        },
        reportDiagnostics: true,
      });
      expect(result.diagnostics, platform).toEqual([]);
    }
  });
});
