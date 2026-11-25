import {
  eventNames,
  paginationContract,
  paginationScenariosFor,
  propNames,
} from '@joralvmel/cosmos-core';
import type { LitElement } from 'lit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CosmButton } from '../src/components/button/cosm-button.js';
import { CosmPagination } from '../src/components/pagination/cosm-pagination.js';
import { cleanup, fixture } from './fixture.js';

afterEach(cleanup);

async function settle(el: CosmPagination) {
  await el.updateComplete;
  await Promise.all(
    [...el.renderRoot.querySelectorAll<LitElement>('cosm-button, cosm-icon-button')].map(
      child => child.updateComplete
    )
  );
}
const pageButton = (el: CosmPagination, page: number) =>
  el.renderRoot.querySelector<CosmButton>(`[data-page="${page}"]`);

describe('cosm-pagination: shared scenarios', () => {
  for (const scenario of paginationScenariosFor('web')) {
    it(scenario.name, async () => {
      const subject = document.createElement('cosm-pagination');
      Object.assign(subject, scenario.props);
      document.body.append(subject);
      try {
        await settle(subject);
        const changes = vi.fn();
        subject.addEventListener('cosm-change', changes);
        pageButton(subject, scenario.target)?.click();
        await settle(subject);
        expect(subject.page).toBe(scenario.expected.page);
        expect(changes.mock.calls.map(([event]) => event.detail.page)).toEqual(
          scenario.expected.changes
        );
      } finally {
        subject.remove();
      }
    });
  }
});

describe('cosm-pagination: contract drift', () => {
  it('exposes every contract prop', () => {
    expect(Object.keys(CosmPagination.properties).sort()).toEqual(
      propNames(paginationContract, 'web').sort()
    );
    expect(eventNames(paginationContract, 'dom')).toEqual(['cosm-change']);
  });
});

describe('cosm-pagination', () => {
  it('renders independent controlled updates after the previous render has completed', async () => {
    const el = await fixture<CosmPagination>(
      '<cosm-pagination label="Results" total-pages="20" page="5"></cosm-pagination>'
    );
    const change = vi.fn();
    el.addEventListener('cosm-change', change);
    el.page = 6;
    await settle(el);
    expect(el.page).toBe(6);
    el.page = 20;
    await settle(el);
    expect(pageButton(el, 20)?.currentPage).toBe(true);
    expect(change).not.toHaveBeenCalled();
  });
  it('restores a removed focused page but does not steal focus from result content', async () => {
    const el = await fixture<CosmPagination>(
      '<cosm-pagination label="Results" total-pages="20" default-page="8"></cosm-pagination>'
    );
    await settle(el);
    pageButton(el, 8)?.focus();
    el.totalPages = 3;
    await settle(el);
    await Promise.resolve();
    expect(el.shadowRoot?.activeElement).toBe(pageButton(el, 3));
    const result = document.createElement('button');
    document.body.append(result);
    try {
      const onChange = vi.fn(() => {
        result.focus();
        expect(document.activeElement).toBe(result);
      });
      el.addEventListener('cosm-change', onChange);
      pageButton(el, 2)?.click();
      await settle(el);
      expect(onChange).toHaveBeenCalledOnce();
      expect(document.activeElement).toBe(result);
    } finally {
      result.remove();
    }
  });
  it('clamps autonomous state permanently on shrink without emitting a change', async () => {
    const el = await fixture<CosmPagination>(
      '<cosm-pagination label="Results" total-pages="10" default-page="9"></cosm-pagination>'
    );
    const changes = vi.fn();
    el.addEventListener('cosm-change', changes);
    el.totalPages = 3;
    await settle(el);
    expect(el.page).toBe(3);
    el.totalPages = 10;
    await settle(el);
    expect(el.page).toBe(3);
    expect(changes).not.toHaveBeenCalled();
  });

  it('derives controlled state from the supplied page again on regrowth', async () => {
    const el = await fixture<CosmPagination>(
      '<cosm-pagination label="Results" total-pages="10" page="9"></cosm-pagination>'
    );
    el.totalPages = 3;
    await settle(el);
    expect(el.page).toBe(3);
    el.totalPages = 10;
    await settle(el);
    expect(el.page).toBe(9);
  });

  it('marks the internal button current without toggle semantics or form submission', async () => {
    const el = await fixture<CosmPagination>(
      '<cosm-pagination label="Results" total-pages="10" default-page="5"></cosm-pagination>'
    );
    await settle(el);
    const current = pageButton(el, 5)?.renderRoot.querySelector('button');
    expect(current?.getAttribute('aria-current')).toBe('page');
    expect(current?.hasAttribute('aria-pressed')).toBe(false);
    expect(current?.type).toBe('button');
    expect(el.renderRoot.querySelector('nav')?.getAttribute('aria-label')).toBe('Results');
    expect(el.renderRoot.querySelectorAll('[part="ellipsis"]')).toHaveLength(2);
  });

  it('hides for zero and one page, then renders a localized RTL compact summary', async () => {
    const el = await fixture<CosmPagination>(
      '<cosm-pagination label="Results" total-pages="0"></cosm-pagination>'
    );
    expect(el.renderRoot.querySelector('nav')).toBeNull();
    el.totalPages = 1;
    await settle(el);
    expect(el.renderRoot.querySelector('nav')).toBeNull();
    Object.assign(el, {
      totalPages: 12,
      page: 5,
      locale: 'ar-EG-u-nu-arab',
      direction: 'rtl',
      presentation: 'compact',
    });
    await settle(el);
    expect(el.renderRoot.querySelector('nav')?.dir).toBe('rtl');
    expect(el.renderRoot.textContent).toContain('Page ٥ of ١٢');
    expect(el.renderRoot.querySelectorAll('cosm-button')).toHaveLength(0);
  });
});
