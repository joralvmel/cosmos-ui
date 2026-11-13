import type { IconDefinition } from '../index.js';

export const alignHorizontalJustifyCenter = {
  name: 'align-horizontal-justify-center',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'rect',
      {
        width: '6',
        height: '14',
        x: '2',
        y: '5',
        rx: '2',
      },
    ],
    [
      'rect',
      {
        width: '6',
        height: '10',
        x: '16',
        y: '7',
        rx: '2',
      },
    ],
    [
      'path',
      {
        d: 'M12 2v20',
      },
    ],
  ],
} as const satisfies IconDefinition;
