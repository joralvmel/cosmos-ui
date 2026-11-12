import type { IconDefinition } from '../index.js';

export const separatorVertical = {
  name: 'separator-vertical',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M12 3v18',
      },
    ],
    [
      'path',
      {
        d: 'm16 16 4-4-4-4',
      },
    ],
    [
      'path',
      {
        d: 'm8 8-4 4 4 4',
      },
    ],
  ],
} as const satisfies IconDefinition;
