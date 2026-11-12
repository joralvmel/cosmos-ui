import type { IconDefinition } from '../index.js';

export const appWindowMac = {
  name: 'app-window-mac',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'rect',
      {
        width: '20',
        height: '16',
        x: '2',
        y: '4',
        rx: '2',
      },
    ],
    [
      'path',
      {
        d: 'M6 8h.01',
      },
    ],
    [
      'path',
      {
        d: 'M10 8h.01',
      },
    ],
    [
      'path',
      {
        d: 'M14 8h.01',
      },
    ],
  ],
} as const satisfies IconDefinition;
