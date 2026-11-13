import type { IconDefinition } from '../index.js';

export const arrowDownToLine = {
  name: 'arrow-down-to-line',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M12 17V3',
      },
    ],
    [
      'path',
      {
        d: 'm6 11 6 6 6-6',
      },
    ],
    [
      'path',
      {
        d: 'M19 21H5',
      },
    ],
  ],
} as const satisfies IconDefinition;
