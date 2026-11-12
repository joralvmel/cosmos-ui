import type { IconDefinition } from '../index.js';

export const lineDotTopVertical = {
  name: 'line-dot-top-vertical',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M12 9v12',
      },
    ],
    [
      'circle',
      {
        cx: '12',
        cy: '6',
        r: '3',
      },
    ],
  ],
} as const satisfies IconDefinition;
