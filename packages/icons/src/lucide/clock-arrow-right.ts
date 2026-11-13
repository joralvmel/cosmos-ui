import type { IconDefinition } from '../index.js';

export const clockArrowRight = {
  name: 'clock-arrow-right',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M12 6v6l2 1',
      },
    ],
    [
      'path',
      {
        d: 'M13.5 21.885A10 10 0 1 1 22 12',
      },
    ],
    [
      'path',
      {
        d: 'M14 18h8',
      },
    ],
    [
      'path',
      {
        d: 'm18 22 4-4-4-4',
      },
    ],
  ],
} as const satisfies IconDefinition;
