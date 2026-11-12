import type { IconDefinition } from '../index.js';

export const calendarMinus = {
  name: 'calendar-minus',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M16 18h6',
      },
    ],
    [
      'path',
      {
        d: 'M16 2v3',
      },
    ],
    [
      'path',
      {
        d: 'M21 14V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h8.3',
      },
    ],
    [
      'path',
      {
        d: 'M3 9h18',
      },
    ],
    [
      'path',
      {
        d: 'M8 2v3',
      },
    ],
  ],
} as const satisfies IconDefinition;
