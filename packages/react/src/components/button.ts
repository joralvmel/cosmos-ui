import type { ButtonPressDetail } from '@joralvmel/cosmos-core';
import { CosmButton } from '@joralvmel/cosmos-elements/button';
import { createComponent, type EventName } from '@lit/react';
import * as React from 'react';

/** React event props of `Button`, mapped to the DOM events of `<cosm-button>`. */
export const buttonEvents = {
  onPress: 'cosm-press' as EventName<CustomEvent<ButtonPressDetail>>,
};

/**
 * React wrapper of `<cosm-button>`. Props are set as element properties; `onPress` receives the
 * original `CustomEvent` (`event.detail.source`).
 */
export const Button = createComponent({
  tagName: 'cosm-button',
  elementClass: CosmButton,
  react: React,
  events: buttonEvents,
  displayName: 'Button',
});

export type ButtonProps = React.ComponentProps<typeof Button>;
