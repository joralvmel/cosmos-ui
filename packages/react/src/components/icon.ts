import { CosmIcon } from '@joralvmel/cosmos-elements/icon';
import { createComponent } from '@lit/react';
import * as React from 'react';

/** The icon contract has no events. */
export const iconEvents = {};

/** React wrapper of `<cosm-icon>`. */
export const Icon = createComponent({
  tagName: 'cosm-icon',
  elementClass: CosmIcon,
  react: React,
  events: iconEvents,
  displayName: 'Icon',
});

export type IconProps = React.ComponentProps<typeof Icon>;
