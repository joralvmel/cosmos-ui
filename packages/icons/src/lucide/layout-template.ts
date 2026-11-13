import type { IconDefinition } from '../index.js';

export const layoutTemplate = {
  name: 'layout-template',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'rect',
      {
        width: '18',
        height: '7',
        x: '3',
        y: '3',
        rx: '1',
      },
    ],
    [
      'rect',
      {
        width: '9',
        height: '7',
        x: '3',
        y: '14',
        rx: '1',
      },
    ],
    [
      'rect',
      {
        width: '5',
        height: '7',
        x: '16',
        y: '14',
        rx: '1',
      },
    ],
  ],
} as const satisfies IconDefinition;
