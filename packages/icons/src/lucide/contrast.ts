import type { IconDefinition } from '../index.js';

export const contrast = {
  name: 'contrast',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'circle',
      {
        cx: '12',
        cy: '12',
        r: '10',
      },
    ],
    [
      'path',
      {
        d: 'M12 18a6 6 0 0 0 0-12v12z',
      },
    ],
  ],
} as const satisfies IconDefinition;
