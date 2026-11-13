import type { IconDefinition } from '../index.js';

export const columns4 = {
  name: 'columns-4',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'rect',
      {
        width: '18',
        height: '18',
        x: '3',
        y: '3',
        rx: '2',
      },
    ],
    [
      'path',
      {
        d: 'M7.5 3v18',
      },
    ],
    [
      'path',
      {
        d: 'M12 3v18',
      },
    ],
    [
      'path',
      {
        d: 'M16.5 3v18',
      },
    ],
  ],
} as const satisfies IconDefinition;
