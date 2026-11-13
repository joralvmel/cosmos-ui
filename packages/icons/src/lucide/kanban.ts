import type { IconDefinition } from '../index.js';

export const kanban = {
  name: 'kanban',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M5 3v14',
      },
    ],
    [
      'path',
      {
        d: 'M12 3v8',
      },
    ],
    [
      'path',
      {
        d: 'M19 3v18',
      },
    ],
  ],
} as const satisfies IconDefinition;
