import type { IconDefinition } from '../index.js';

export const smartphoneCharging = {
  name: 'smartphone-charging',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'rect',
      {
        width: '14',
        height: '20',
        x: '5',
        y: '2',
        rx: '2',
        ry: '2',
      },
    ],
    [
      'path',
      {
        d: 'M12.667 8 10 12h4l-2.667 4',
      },
    ],
  ],
} as const satisfies IconDefinition;
