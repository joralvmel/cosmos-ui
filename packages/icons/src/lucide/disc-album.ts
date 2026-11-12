import type { IconDefinition } from '../index.js';

export const discAlbum = {
  name: 'disc-album',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'rect',
      {
        width: '18',
        height: '18',
        x: '3',
        y: '3',
        rx: '2',
      },
    ],
    [
      'circle',
      {
        cx: '12',
        cy: '12',
        r: '5',
      },
    ],
    [
      'path',
      {
        d: 'M12 12h.01',
      },
    ],
  ],
} as const satisfies IconDefinition;
