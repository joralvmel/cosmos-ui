import type { CheckboxCheckedChangeDetail } from '@joralvmel/cosmos-core';
import { CosmCheckbox } from '@joralvmel/cosmos-elements/checkbox';
import { createComponent, type EventName } from '@lit/react';
import * as React from 'react';
import { flushSync } from 'react-dom';

/** React event props of `Checkbox`, mapped to the original DOM `CustomEvent`. */
export const checkboxEvents = {
  onCheckedChange: 'cosm-checked-change' as EventName<CustomEvent<CheckboxCheckedChangeDetail>>,
};

const CheckboxElement = createComponent({
  tagName: 'cosm-checkbox',
  elementClass: CosmCheckbox,
  react: React,
  events: checkboxEvents,
  displayName: 'CheckboxElement',
});

type ElementProps = React.ComponentProps<typeof CheckboxElement>;

/** React wrapper; a supplied checked value, including false, is controlled. */
export const Checkbox = React.forwardRef<CosmCheckbox, CheckboxProps>((props, forwardedRef) => {
  const { checked, onCheckedChange, ...elementProps } = props;
  const handleCheckedChange = React.useCallback(
    (event: CustomEvent<CheckboxCheckedChangeDetail>) => {
      if (onCheckedChange) flushSync(() => onCheckedChange(event));
    },
    [onCheckedChange]
  );
  const setRef = React.useCallback(
    (element: CosmCheckbox | null) => {
      if (element) element.checkedControlled = checked !== undefined;
      if (typeof forwardedRef === 'function') forwardedRef(element);
      else if (forwardedRef) forwardedRef.current = element;
    },
    [checked, forwardedRef]
  );
  return React.createElement(CheckboxElement, {
    ...elementProps,
    checked,
    onCheckedChange: handleCheckedChange,
    ref: setRef,
  } as ElementProps);
});

Checkbox.displayName = 'Checkbox';

export type CheckboxProps = Omit<ElementProps, 'onCheckedChange'> & {
  label: string;
  checked?: boolean;
  onCheckedChange?: (event: CustomEvent<CheckboxCheckedChangeDetail>) => void;
};
