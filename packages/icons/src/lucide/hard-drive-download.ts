import type { IconDefinition } from '../index.js';

export const hardDriveDownload = {
  name: 'hard-drive-download',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M12 2v8',
      },
    ],
    [
      'path',
      {
        d: 'm16 6-4 4-4-4',
      },
    ],
    [
      'rect',
      {
        width: '20',
        height: '8',
        x: '2',
        y: '14',
        rx: '2',
      },
    ],
    [
      'path',
      {
        d: 'M6 18h.01',
      },
    ],
    [
      'path',
      {
        d: 'M10 18h.01',
      },
    ],
  ],
} as const satisfies IconDefinition;
