import type { IconDefinition } from '../index.js';

export const alarmClock = {
  name: 'alarm-clock',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'circle',
      {
        cx: '12',
        cy: '13',
        r: '8',
      },
    ],
    [
      'path',
      {
        d: 'M12 9v4l2 2',
      },
    ],
    [
      'path',
      {
        d: 'M5 3 2 6',
      },
    ],
    [
      'path',
      {
        d: 'm22 6-3-3',
      },
    ],
    [
      'path',
      {
        d: 'M6.38 18.7 4 21',
      },
    ],
    [
      'path',
      {
        d: 'M17.64 18.67 20 21',
      },
    ],
  ],
} as const satisfies IconDefinition;
