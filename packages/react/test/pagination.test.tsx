import {
  eventNames,
  paginationContract,
  paginationScenariosFor,
  propNames,
} from '@joralvmel/cosmos-core';
import type { CosmButton } from '@joralvmel/cosmos-elements/button';
import type { CosmPagination } from '@joralvmel/cosmos-elements/pagination';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Pagination, paginationEvents } from '../src/index.js';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
let root: Root | undefined;
let container: HTMLElement | undefined;
afterEach(async () => {
  await act(async () => root?.unmount());
  container?.remove();
});

describe('Pagination: shared scenarios', () => {
  for (const scenario of paginationScenariosFor('react')) {
    it(scenario.name, async () => {
      container = document.createElement('div');
      document.body.append(container);
      root = createRoot(container);
      const onChange = vi.fn();
      await act(async () => root?.render(<Pagination {...scenario.props} onChange={onChange} />));
      const el = container.querySelector<CosmPagination>('cosm-pagination');
      expect(el).not.toBeNull();
      await act(async () => el?.updateComplete);
      const target = el?.renderRoot.querySelector<CosmButton>(`[data-page="${scenario.target}"]`);
      await target?.updateComplete;
      await act(async () => {
        target?.click();
        await el?.updateComplete;
      });
      expect(el?.page).toBe(scenario.expected.page);
      expect(onChange.mock.calls.map(([event]) => event.detail.page)).toEqual(
        scenario.expected.changes
      );
    });
  }
});

describe('Pagination: contract drift', () => {
  it('maps all events and forwards all properties', () => {
    expect(Object.keys(paginationEvents)).toEqual(eventNames(paginationContract, 'react'));
    expect(Object.values(paginationEvents)).toEqual(eventNames(paginationContract, 'dom'));
    const el = document.createElement('cosm-pagination');
    for (const name of propNames(paginationContract, 'react')) expect(name in el).toBe(true);
  });
});
