import type { IconDefinition } from '../index.js';

export const eighthNote = {
  name: 'eighth-note',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'm19 6-5.2-3.9a.5.5 0 0 0-.8.4V18',
      },
    ],
    [
      'circle',
      {
        cx: '9',
        cy: '18',
        r: '4',
      },
    ],
  ],
} as const satisfies IconDefinition;
