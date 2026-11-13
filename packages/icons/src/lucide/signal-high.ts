import type { IconDefinition } from '../index.js';

export const signalHigh = {
  name: 'signal-high',
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
    [
      'path',
      {
        d: 'M12 20v-8',
      },
    ],
    [
      'path',
      {
        d: 'M17 20V8',
      },
    ],
  ],
} as const satisfies IconDefinition;
