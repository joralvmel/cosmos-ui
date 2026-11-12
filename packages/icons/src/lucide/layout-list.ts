import type { IconDefinition } from '../index.js';

export const layoutList = {
  name: 'layout-list',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'rect',
      {
        width: '7',
        height: '7',
        x: '3',
        y: '3',
        rx: '1',
      },
    ],
    [
      'rect',
      {
        width: '7',
        height: '7',
        x: '3',
        y: '14',
        rx: '1',
      },
    ],
    [
      'path',
      {
        d: 'M14 4h7',
      },
    ],
    [
      'path',
      {
        d: 'M14 9h7',
      },
    ],
    [
      'path',
      {
        d: 'M14 15h7',
      },
    ],
    [
      'path',
      {
        d: 'M14 20h7',
      },
    ],
  ],
} as const satisfies IconDefinition;
