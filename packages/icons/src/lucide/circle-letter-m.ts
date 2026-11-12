import type { IconDefinition } from '../index.js';

export const circleLetterM = {
  name: 'circle-letter-m',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M8 16.001v-7.5a.5.5 0 0 1 .9-.3l2.7 3.599a.5.5 0 0 0 .8 0l2.7-3.6a.5.5 0 0 1 .9.3v7.501',
      },
    ],
    [
      'circle',
      {
        cx: '12',
        cy: '12',
        r: '10',
      },
    ],
  ],
} as const satisfies IconDefinition;
