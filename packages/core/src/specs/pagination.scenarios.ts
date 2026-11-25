import type { ContractProps, Platform } from '../contract.js';
import type { paginationContract } from './pagination.js';

export interface PaginationScenario {
  name: string;
  props: ContractProps<typeof paginationContract, 'web'>;
  target: number;
  expected: { page: number; changes: number[] };
}

/** State ownership and disabled activation shared by all platform drivers. */
export const paginationScenarios: readonly PaginationScenario[] = [
  {
    name: 'commits autonomous selection',
    props: { totalPages: 10, label: 'Results', defaultPage: 5 },
    target: 6,
    expected: { page: 6, changes: [6] },
  },
  {
    name: 'proposes controlled selection without committing',
    props: { totalPages: 10, label: 'Results', page: 5 },
    target: 6,
    expected: { page: 5, changes: [6] },
  },
  {
    name: 'ignores the current page',
    props: { totalPages: 10, label: 'Results', defaultPage: 5 },
    target: 5,
    expected: { page: 5, changes: [] },
  },
  {
    name: 'ignores disabled selection',
    props: { totalPages: 10, label: 'Results', defaultPage: 5, disabled: true },
    target: 6,
    expected: { page: 5, changes: [] },
  },
];

export const paginationScenariosFor = (_platform: Platform) => paginationScenarios;
