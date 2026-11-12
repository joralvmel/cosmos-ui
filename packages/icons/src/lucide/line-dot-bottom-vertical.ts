import type { IconDefinition } from '../index.js';

export const lineDotBottomVertical = {
  name: 'line-dot-bottom-vertical',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M12 3v12',
      },
    ],
    [
      'circle',
      {
        cx: '12',
        cy: '18',
        r: '3',
      },
    ],
  ],
} as const satisfies IconDefinition;
