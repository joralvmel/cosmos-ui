import type { SelectChangeDetail } from '@joralvmel/cosmos-core';
import { CosmSelect } from '@joralvmel/cosmos-elements/select';
import { createComponent, type EventName } from '@lit/react';
import * as React from 'react';
import { flushSync } from 'react-dom';

/** React event props of `Select`, mapped to the original DOM `CustomEvent`. */
export const selectEvents = {
  onChange: 'cosm-change' as EventName<CustomEvent<SelectChangeDetail>>,
};

const SelectElement = createComponent({
  tagName: 'cosm-select',
  elementClass: CosmSelect,
  react: React,
  events: selectEvents,
  displayName: 'SelectElement',
});

type ElementProps = React.ComponentProps<typeof SelectElement>;

/** React wrapper; a supplied value, including `null`, keeps the selection controlled. */
export const Select = React.forwardRef<CosmSelect, SelectProps>((props, forwardedRef) => {
  const { value, onChange, ...elementProps } = props;
  const handleChange = React.useCallback(
    (event: CustomEvent<SelectChangeDetail>) => {
      if (onChange) flushSync(() => onChange(event));
    },
    [onChange]
  );
  const setRef = React.useCallback(
    (element: CosmSelect | null) => {
      if (element) element.valueControlled = value !== undefined;
      if (typeof forwardedRef === 'function') forwardedRef(element);
      else if (forwardedRef) forwardedRef.current = element;
    },
    [forwardedRef, value]
  );
  return React.createElement(SelectElement, {
    ...elementProps,
    value,
    onChange: handleChange,
    ref: setRef,
  } as ElementProps);
});

Select.displayName = 'Select';

export type SelectProps = Omit<ElementProps, 'onChange'> & {
  label: string;
  items: CosmSelect['items'];
  value?: CosmSelect['value'];
  defaultValue?: CosmSelect['defaultValue'];
  onChange?: (event: CustomEvent<SelectChangeDetail>) => void;
};
