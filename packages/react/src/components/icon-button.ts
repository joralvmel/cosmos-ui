import type { IconButtonPressDetail, IconButtonPressedChangeDetail } from '@joralvmel/cosmos-core';
import { CosmIconButton } from '@joralvmel/cosmos-elements/icon-button';
import { createComponent, type EventName } from '@lit/react';
import * as React from 'react';
import { flushSync } from 'react-dom';

export const iconButtonEvents = {
  onPress: 'cosm-press' as EventName<CustomEvent<IconButtonPressDetail>>,
  onPressedChange: 'cosm-pressed-change' as EventName<CustomEvent<IconButtonPressedChangeDetail>>,
};

const IconButtonElement = createComponent({
  tagName: 'cosm-icon-button',
  elementClass: CosmIconButton,
  react: React,
  events: iconButtonEvents,
  displayName: 'IconButtonElement',
});

type ElementProps = React.ComponentProps<typeof IconButtonElement>;

/** React wrapper; a supplied pressed value, including false, is controlled. */
export const IconButton = React.forwardRef<CosmIconButton, IconButtonProps>(
  (props, forwardedRef) => {
    const { pressed, onPressedChange, ...elementProps } = props;
    const handleChange = React.useCallback(
      (event: CustomEvent<IconButtonPressedChangeDetail>) => {
        if (onPressedChange) flushSync(() => onPressedChange(event));
      },
      [onPressedChange]
    );
    const setRef = React.useCallback(
      (element: CosmIconButton | null) => {
        if (element) element.pressedControlled = pressed !== undefined;
        if (typeof forwardedRef === 'function') forwardedRef(element);
        else if (forwardedRef) forwardedRef.current = element;
      },
      [forwardedRef, pressed]
    );
    return React.createElement(IconButtonElement, {
      ...elementProps,
      pressed,
      onPressedChange: handleChange,
      ref: setRef,
    } as ElementProps);
  }
);
IconButton.displayName = 'IconButton';

export type IconButtonProps = Omit<ElementProps, 'label' | 'onPress' | 'onPressedChange'> & {
  label: string;
  onPress?: (event: CustomEvent<IconButtonPressDetail>) => void;
  onPressedChange?: (event: CustomEvent<IconButtonPressedChangeDetail>) => void;
};
