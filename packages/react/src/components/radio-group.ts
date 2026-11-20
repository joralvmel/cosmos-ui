import type { RadioGroupChangeDetail } from '@joralvmel/cosmos-core';
import { CosmRadioGroup } from '@joralvmel/cosmos-elements/radio-group';
import { createComponent, type EventName } from '@lit/react';
import * as React from 'react';
import { flushSync } from 'react-dom';

/** React event props of `RadioGroup`, mapped to the original DOM `CustomEvent`. */
export const radioGroupEvents = {
  onChange: 'cosm-change' as EventName<CustomEvent<RadioGroupChangeDetail>>,
};

const RadioGroupElement = createComponent({
  tagName: 'cosm-radio-group',
  elementClass: CosmRadioGroup,
  react: React,
  events: radioGroupEvents,
  displayName: 'RadioGroupElement',
});

type ElementProps = React.ComponentProps<typeof RadioGroupElement>;

/** React wrapper; a supplied value, including null, keeps selection controlled. */
export const RadioGroup = React.forwardRef<CosmRadioGroup, RadioGroupProps>(
  (props, forwardedRef) => {
    const { value, onChange, ...elementProps } = props;
    const handleChange = React.useCallback(
      (event: CustomEvent<RadioGroupChangeDetail>) => {
        if (onChange) flushSync(() => onChange(event));
      },
      [onChange]
    );
    const setRef = React.useCallback(
      (element: CosmRadioGroup | null) => {
        if (element) element.valueControlled = value !== undefined;
        if (typeof forwardedRef === 'function') forwardedRef(element);
        else if (forwardedRef) forwardedRef.current = element;
      },
      [forwardedRef, value]
    );
    return React.createElement(RadioGroupElement, {
      ...elementProps,
      value,
      onChange: handleChange,
      ref: setRef,
    } as ElementProps);
  }
);

RadioGroup.displayName = 'RadioGroup';

export type RadioGroupProps = Omit<ElementProps, 'onChange'> & {
  label: string;
  options: CosmRadioGroup['options'];
  value?: CosmRadioGroup['value'];
  defaultValue?: CosmRadioGroup['defaultValue'];
  onChange?: (event: CustomEvent<RadioGroupChangeDetail>) => void;
};
