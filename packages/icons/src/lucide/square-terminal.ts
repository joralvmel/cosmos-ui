import type { IconDefinition } from '../index.js';

export const squareTerminal = {
  name: 'square-terminal',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'm7 11 2-2-2-2',
      },
    ],
    [
      'path',
      {
        d: 'M11 13h4',
      },
    ],
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
  ],
} as const satisfies IconDefinition;
