import { CosmBadge } from '@joralvmel/cosmos-elements/badge';
import { createComponent } from '@lit/react';
import * as React from 'react';

/** Badge has no events. */
export const badgeEvents = {};

/** React wrapper of `<cosm-badge>`. */
export const Badge = createComponent({
  tagName: 'cosm-badge',
  elementClass: CosmBadge,
  react: React,
  events: badgeEvents,
  displayName: 'Badge',
});

export type BadgeProps = React.ComponentProps<typeof Badge>;
