import type { IconDefinition } from '../index.js';

export const crop = {
  name: 'crop',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M6 2v14a2 2 0 0 0 2 2h14',
      },
    ],
    [
      'path',
      {
        d: 'M18 22V8a2 2 0 0 0-2-2H2',
      },
    ],
  ],
} as const satisfies IconDefinition;
