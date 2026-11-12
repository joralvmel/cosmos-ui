import type { IconDefinition } from '../index.js';

export const speaker = {
  name: 'speaker',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'rect',
      {
        width: '16',
        height: '20',
        x: '4',
        y: '2',
        rx: '2',
      },
    ],
    [
      'path',
      {
        d: 'M12 6h.01',
      },
    ],
    [
      'circle',
      {
        cx: '12',
        cy: '14',
        r: '4',
      },
    ],
    [
      'path',
      {
        d: 'M12 14h.01',
      },
    ],
  ],
} as const satisfies IconDefinition;
