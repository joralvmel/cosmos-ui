import type { SwitchCheckedChangeDetail } from '@joralvmel/cosmos-core';
import { CosmSwitch } from '@joralvmel/cosmos-elements/switch';
import { createComponent, type EventName } from '@lit/react';
import * as React from 'react';
import { flushSync } from 'react-dom';

/** React event props of `Switch`, mapped to the original DOM `CustomEvent`. */
export const switchEvents = {
  onCheckedChange: 'cosm-checked-change' as EventName<CustomEvent<SwitchCheckedChangeDetail>>,
};

const SwitchElement = createComponent({
  tagName: 'cosm-switch',
  elementClass: CosmSwitch,
  react: React,
  events: switchEvents,
  displayName: 'SwitchElement',
});

type ElementProps = React.ComponentProps<typeof SwitchElement>;

/** React wrapper; a supplied checked value, including false, is controlled. */
export const Switch = React.forwardRef<CosmSwitch, SwitchProps>((props, forwardedRef) => {
  const { checked, onCheckedChange, ...elementProps } = props;
  const handleCheckedChange = React.useCallback(
    (event: CustomEvent<SwitchCheckedChangeDetail>) => {
      if (onCheckedChange) flushSync(() => onCheckedChange(event));
    },
    [onCheckedChange]
  );
  const setRef = React.useCallback(
    (element: CosmSwitch | null) => {
      if (element) element.checkedControlled = checked !== undefined;
      if (typeof forwardedRef === 'function') forwardedRef(element);
      else if (forwardedRef) forwardedRef.current = element;
    },
    [checked, forwardedRef]
  );
  return React.createElement(SwitchElement, {
    ...elementProps,
    checked,
    onCheckedChange: handleCheckedChange,
    ref: setRef,
  } as ElementProps);
});

Switch.displayName = 'Switch';

export type SwitchProps = Omit<ElementProps, 'children' | 'onCheckedChange'> & {
  label: string;
  checked?: boolean;
  onCheckedChange?: (event: CustomEvent<SwitchCheckedChangeDetail>) => void;
};
