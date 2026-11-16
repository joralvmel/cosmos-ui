// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { highlightCode } from '../src/lib/highlight';

describe('playground syntax highlighting', () => {
  it('preserves the exact source as text and colors code without interpreting markup', async () => {
    const node = document.createElement('code');
    const source = '<img src=x onerror="alert(1)">\n<script>const size = 32;</script>';
    node.textContent = source;
    await highlightCode(node, source, 'html');
    expect(node.textContent).toBe(source);
    expect(node.querySelector('img, script')).toBeNull();
    expect(node.querySelector('span')?.style.getPropertyValue('--code-light')).toBeTruthy();
    expect(node.querySelector('span')?.style.getPropertyValue('--code-dark')).toBeTruthy();
  });

  it('does not replace a newer snippet while the highlighter loads', async () => {
    const node = document.createElement('code');
    node.textContent = 'const before = 1;';
    const pending = highlightCode(node, node.textContent, 'react');
    node.textContent = 'const after = 2;';
    await pending;
    expect(node.textContent).toBe('const after = 2;');
  });
});
