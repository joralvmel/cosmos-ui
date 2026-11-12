import type { IconDefinition } from '../index.js';

export const chevronsLeftRightEllipsis = {
  name: 'chevrons-left-right-ellipsis',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M12 12h.01',
      },
    ],
    [
      'path',
      {
        d: 'M16 12h.01',
      },
    ],
    [
      'path',
      {
        d: 'm17 7 5 5-5 5',
      },
    ],
    [
      'path',
      {
        d: 'm7 7-5 5 5 5',
      },
    ],
    [
      'path',
      {
        d: 'M8 12h.01',
      },
    ],
  ],
} as const satisfies IconDefinition;
