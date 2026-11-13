import type { IconDefinition } from '../index.js';

export const thermometer = {
  name: 'thermometer',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z',
      },
    ],
  ],
} as const satisfies IconDefinition;
