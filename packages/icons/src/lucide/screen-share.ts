import type { IconDefinition } from '../index.js';

export const screenShare = {
  name: 'screen-share',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M13 3H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-3',
      },
    ],
    [
      'path',
      {
        d: 'M8 21h8',
      },
    ],
    [
      'path',
      {
        d: 'M12 17v4',
      },
    ],
    [
      'path',
      {
        d: 'm17 8 5-5',
      },
    ],
    [
      'path',
      {
        d: 'M17 3h5v5',
      },
    ],
  ],
} as const satisfies IconDefinition;
