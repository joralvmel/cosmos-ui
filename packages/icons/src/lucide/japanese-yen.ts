import type { IconDefinition } from '../index.js';

export const japaneseYen = {
  name: 'japanese-yen',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M12 12v8',
      },
    ],
    [
      'path',
      {
        d: 'm6 4 6 8 6-8',
      },
    ],
    [
      'path',
      {
        d: 'M8 13h8',
      },
    ],
    [
      'path',
      {
        d: 'M8 17h8',
      },
    ],
  ],
} as const satisfies IconDefinition;
