import { defineContract } from '../contract.js';

/** Proposed one-based page. */
export interface PaginationChangeDetail {
  page: number;
}

/** A bounded button-based navigation landmark for a known number of pages. */
export const paginationContract = defineContract({
  name: 'pagination',
  tag: 'cosm-pagination',
  description: 'Navigates a known number of pages using buttons.',
  role: 'navigation',
  pattern: 'https://www.w3.org/WAI/ARIA/apg/practices/landmark-regions/',
  props: {
    totalPages: {
      type: 'number',
      required: true,
      description: 'Required nonnegative safe integer page count.',
    },
    page: {
      type: 'number',
      description:
        'Controlled one-based safe integer page; out-of-range values are displayed clamped.',
    },
    defaultPage: {
      type: 'number',
      default: 1,
      description: 'Initial one-based page for autonomous state.',
    },
    label: {
      type: 'string',
      required: true,
      description: 'Required localized navigation landmark label.',
    },
    previousLabel: {
      type: 'string',
      default: 'Previous page',
      description: 'Previous button label.',
    },
    nextLabel: { type: 'string', default: 'Next page', description: 'Next button label.' },
    firstLabel: { type: 'string', default: 'First page', description: 'First button label.' },
    lastLabel: { type: 'string', default: 'Last page', description: 'Last button label.' },
    pageLabel: {
      type: 'string',
      default: 'Page {page}',
      description: 'Page button label template; {page} is replaced with the localized number.',
    },
    summaryLabel: {
      type: 'string',
      default: 'Page {page} of {total}',
      description: 'Compact summary template with {page} and {total} placeholders.',
    },
    locale: { type: 'string', description: 'Locale for formatted page numbers.' },
    direction: {
      type: 'enum',
      values: ['ltr', 'rtl'],
      default: 'ltr',
      description: 'Layout and directional icon direction.',
    },
    presentation: {
      type: 'enum',
      values: ['numbered', 'compact'],
      default: 'numbered',
      reflect: true,
      description: 'Show up to seven fixed-width numbered positions or a compact summary.',
    },
    variant: {
      type: 'enum',
      values: ['solid', 'soft', 'outline'],
      default: 'solid',
      reflect: true,
      description: 'Selected page emphasis.',
    },
    size: {
      type: 'enum',
      values: ['sm', 'md', 'lg'],
      default: 'md',
      reflect: true,
      description: 'Control size.',
    },
    showFirstLast: {
      type: 'boolean',
      default: false,
      description: 'Show first and last page controls.',
    },
    disabled: {
      type: 'boolean',
      default: false,
      reflect: true,
      description: 'Disable all controls.',
    },
  },
  events: {
    change: {
      description: 'Proposes a different page after enabled user activation.',
      detail: 'PaginationChangeDetail',
      names: {
        dom: 'cosm-change',
        react: 'onChange',
        angular: 'pageChange',
        native: 'onPageChange',
      },
    },
  },
  states: [{ prop: 'page', event: 'change', defaultProp: 'defaultPage' }],
  slots: {},
  parts: {
    base: 'Navigation landmark.',
    control: 'Navigation control.',
    page: 'Page control.',
    current: 'Current page control.',
    ellipsis: 'Decorative omitted-page indicator.',
    summary: 'Compact summary.',
  },
  cssProperties: {
    '--cosm-pagination-gap': 'Gap between controls.',
    '--cosm-pagination-min-height': 'Minimum control height.',
    '--cosm-pagination-radius': 'Control corner radius.',
    '--cosm-pagination-current-background': 'Current page background.',
    '--cosm-pagination-current-color': 'Current page foreground.',
    '--cosm-pagination-current-border': 'Current page border color.',
  },
  keyboard: [
    { keys: ['Tab', 'Shift+Tab'], action: 'Moves between enabled controls.' },
    { keys: ['Enter', 'Space'], action: 'Activates the focused control.' },
  ],
});
