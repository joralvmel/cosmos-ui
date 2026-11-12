import type { IconDefinition } from '../index.js';

export const zodiacAries = {
  name: 'zodiac-aries',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M12 7.5a4.5 4.5 0 1 1 5 4.5',
      },
    ],
    [
      'path',
      {
        d: 'M7 12a4.5 4.5 0 1 1 5-4.5V21',
      },
    ],
  ],
} as const satisfies IconDefinition;
