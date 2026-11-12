import type { IconDefinition } from '../index.js';

export const usbCPort = {
  name: 'usb-c-port',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M6 12h12',
      },
    ],
    [
      'rect',
      {
        x: '2',
        y: '8',
        width: '20',
        height: '8',
        rx: '4',
      },
    ],
  ],
} as const satisfies IconDefinition;
