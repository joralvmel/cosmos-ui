import type { IconDefinition } from '../index.js';

export const bridge = {
  name: 'bridge',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M10 9.728V16',
      },
    ],
    [
      'path',
      {
        d: 'M14 9.728V16',
      },
    ],
    [
      'path',
      {
        d: 'M18 20V4',
      },
    ],
    [
      'path',
      {
        d: 'm22 11-4-4A7.5 7.5 0 0 1 6 7l-4 4',
      },
    ],
    [
      'path',
      {
        d: 'M22 16H2',
      },
    ],
    [
      'path',
      {
        d: 'M6 20V4',
      },
    ],
  ],
} as const satisfies IconDefinition;
