import type { TextFieldChangeDetail, TextFieldSubmitDetail } from '@joralvmel/cosmos-core';
import { CosmTextField } from '@joralvmel/cosmos-elements/text-field';
import { createComponent, type EventName } from '@lit/react';
import * as React from 'react';
import { flushSync } from 'react-dom';

/** React event props of `TextField`, mapped to the original DOM `CustomEvent`s. */
export const textFieldEvents = {
  onChange: 'cosm-change' as EventName<CustomEvent<TextFieldChangeDetail>>,
  onSubmit: 'cosm-submit' as EventName<CustomEvent<TextFieldSubmitDetail>>,
};

const TextFieldElement = createComponent({
  tagName: 'cosm-text-field',
  elementClass: CosmTextField,
  react: React,
  events: textFieldEvents,
  displayName: 'TextFieldElement',
});

type ElementProps = React.ComponentProps<typeof TextFieldElement>;

/** React wrapper of `<cosm-text-field>`; binding `value`, including `''`, marks it controlled. */
export const TextField = React.forwardRef<CosmTextField, TextFieldProps>((props, forwardedRef) => {
  const { value, onChange, ...elementProps } = props;
  const handleChange = React.useCallback(
    (event: CustomEvent<TextFieldChangeDetail>) => {
      if (onChange) flushSync(() => onChange(event));
    },
    [onChange]
  );
  const setRef = React.useCallback(
    (element: CosmTextField | null) => {
      if (element) element.valueControlled = value !== undefined;
      if (typeof forwardedRef === 'function') forwardedRef(element);
      else if (forwardedRef) forwardedRef.current = element;
    },
    [forwardedRef, value]
  );
  return React.createElement(TextFieldElement, {
    ...elementProps,
    value,
    onChange: handleChange,
    ref: setRef,
  } as ElementProps);
});

TextField.displayName = 'TextField';

export type TextFieldProps = Omit<ElementProps, 'onChange' | 'onSubmit'> & {
  label: string;
  onChange?: (event: CustomEvent<TextFieldChangeDetail>) => void;
  onSubmit?: (event: CustomEvent<TextFieldSubmitDetail>) => void;
};
