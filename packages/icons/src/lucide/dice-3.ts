import type { IconDefinition } from '../index.js';

export const dice3 = {
  name: 'dice-3',
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
        ry: '2',
      },
    ],
    [
      'path',
      {
        d: 'M16 8h.01',
      },
    ],
    [
      'path',
      {
        d: 'M12 12h.01',
      },
    ],
    [
      'path',
      {
        d: 'M8 16h.01',
      },
    ],
  ],
} as const satisfies IconDefinition;
