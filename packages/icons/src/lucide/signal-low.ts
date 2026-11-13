import type { IconDefinition } from '../index.js';

export const signalLow = {
  name: 'signal-low',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M2 20h.01',
      },
    ],
    [
      'path',
      {
        d: 'M7 20v-4',
      },
    ],
  ],
} as const satisfies IconDefinition;
