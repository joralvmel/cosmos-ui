import { paginationContract, paginationScenariosFor, propNames } from '@joralvmel/cosmos-core';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Pagination, paginationPropNames } from '../src/index.js';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
let root: Root | undefined;
let container: HTMLElement | undefined;
afterEach(async () => {
  await act(async () => root?.unmount());
  container?.remove();
});

describe('Pagination (native): shared scenarios', () => {
  for (const scenario of paginationScenariosFor('native')) {
    it(scenario.name, async () => {
      container = document.createElement('div');
      document.body.append(container);
      root = createRoot(container);
      const onPageChange = vi.fn();
      await act(async () =>
        root?.render(<Pagination {...scenario.props} onPageChange={onPageChange} />)
      );
      const target = container.querySelector<HTMLButtonElement>(
        `[aria-label="Page ${scenario.target}"]`
      );
      await act(async () => target?.click());
      const current = container.querySelector('[aria-current="page"]');
      expect(current?.textContent).toBe(String(scenario.expected.page));
      expect(onPageChange.mock.calls.map(([event]) => event.page)).toEqual(
        scenario.expected.changes
      );
    });
  }
});

describe('Pagination (native): contract drift', () => {
  it('implements the shared properties', () => {
    expect([...paginationPropNames].sort()).toEqual(propNames(paginationContract, 'native').sort());
  });
});

describe('Pagination (native)', () => {
  it('respects application result focus after a page proposal on web', async () => {
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    const result = document.createElement('button');
    document.body.append(result);
    try {
      await act(async () =>
        root?.render(
          <Pagination
            label="Results"
            totalPages={10}
            defaultPage={5}
            onPageChange={() => result.focus()}
          />
        )
      );
      const next = container.querySelector<HTMLButtonElement>('[aria-label="Page 6"]');
      await act(async () => next?.click());
      expect(document.activeElement).toBe(result);
    } finally {
      result.remove();
    }
  });
  it('clamps on shrink without events and retains at least 44-point custom targets', async () => {
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    const change = vi.fn();
    const render = async (totalPages: number) => {
      await act(async () =>
        root?.render(
          <Pagination
            label="Results"
            totalPages={totalPages}
            defaultPage={9}
            controlStyle={{ minHeight: 12 }}
            onPageChange={change}
          />
        )
      );
    };
    await render(10);
    await render(3);
    await render(10);
    expect(container.querySelector('[aria-current="page"]')?.textContent).toBe('3');
    for (const button of container.querySelectorAll('button')) {
      expect(
        JSON.parse(button.getAttribute('data-style') ?? '{}').minHeight
      ).toBeGreaterThanOrEqual(44);
    }
    expect(change).not.toHaveBeenCalled();
  });
});
