import type { IconDefinition } from '../index.js';

export const share = {
  name: 'share',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M12 2v13',
      },
    ],
    [
      'path',
      {
        d: 'm16 6-4-4-4 4',
      },
    ],
    [
      'path',
      {
        d: 'M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8',
      },
    ],
  ],
} as const satisfies IconDefinition;
