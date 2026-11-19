import type { TextareaChangeDetail } from '@joralvmel/cosmos-core';
import { CosmTextarea } from '@joralvmel/cosmos-elements/textarea';
import { createComponent, type EventName } from '@lit/react';
import * as React from 'react';
import { flushSync } from 'react-dom';

/** React event props of `Textarea`, mapped to the original DOM `CustomEvent`s. */
export const textareaEvents = {
  onChange: 'cosm-change' as EventName<CustomEvent<TextareaChangeDetail>>,
};

const TextareaElement = createComponent({
  tagName: 'cosm-textarea',
  elementClass: CosmTextarea,
  react: React,
  events: textareaEvents,
  displayName: 'TextareaElement',
});

type ElementProps = React.ComponentProps<typeof TextareaElement>;

/** React wrapper of `<cosm-textarea>`; binding `value`, including `''`, marks it controlled. */
export const Textarea = React.forwardRef<CosmTextarea, TextareaProps>((props, forwardedRef) => {
  const { value, onChange, ...elementProps } = props;
  const handleChange = React.useCallback(
    (event: CustomEvent<TextareaChangeDetail>) => {
      if (onChange) flushSync(() => onChange(event));
    },
    [onChange]
  );
  const setRef = React.useCallback(
    (element: CosmTextarea | null) => {
      if (element) element.valueControlled = value !== undefined;
      if (typeof forwardedRef === 'function') forwardedRef(element);
      else if (forwardedRef) forwardedRef.current = element;
    },
    [forwardedRef, value]
  );
  return React.createElement(TextareaElement, {
    ...elementProps,
    value,
    onChange: handleChange,
    ref: setRef,
  } as ElementProps);
});

Textarea.displayName = 'Textarea';

export type TextareaProps = Omit<ElementProps, 'onChange'> & {
  label: string;
  onChange?: (event: CustomEvent<TextareaChangeDetail>) => void;
};
