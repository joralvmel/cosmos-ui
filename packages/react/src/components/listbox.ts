import type { ListboxSelectionChangeDetail } from '@joralvmel/cosmos-core';
import { CosmListbox } from '@joralvmel/cosmos-elements/listbox';
import { createComponent, type EventName } from '@lit/react';
import * as React from 'react';
import { flushSync } from 'react-dom';

/** React event props of `Listbox`, mapped to the original DOM `CustomEvent`. */
export const listboxEvents = {
  onSelectionChange: 'cosm-selection-change' as EventName<
    CustomEvent<ListboxSelectionChangeDetail>
  >,
};

const ListboxElement = createComponent({
  tagName: 'cosm-listbox',
  elementClass: CosmListbox,
  react: React,
  events: listboxEvents,
  displayName: 'ListboxElement',
});

type ElementProps = React.ComponentProps<typeof ListboxElement>;

/** React wrapper of `<cosm-listbox>`; a supplied selectedValues array, including `[]`, is controlled. */
export const Listbox = React.forwardRef<CosmListbox, ListboxProps>((props, forwardedRef) => {
  const { selectedValues, onSelectionChange, ...elementProps } = props;
  const handleSelectionChange = React.useCallback(
    (event: CustomEvent<ListboxSelectionChangeDetail>) => {
      if (onSelectionChange) flushSync(() => onSelectionChange(event));
    },
    [onSelectionChange]
  );
  const setRef = React.useCallback(
    (element: CosmListbox | null) => {
      if (element) element.selectedValuesControlled = selectedValues !== undefined;
      if (typeof forwardedRef === 'function') forwardedRef(element);
      else if (forwardedRef) forwardedRef.current = element;
    },
    [forwardedRef, selectedValues]
  );
  return React.createElement(ListboxElement, {
    ...elementProps,
    selectedValues,
    onSelectionChange: handleSelectionChange,
    ref: setRef,
  } as ElementProps);
});

Listbox.displayName = 'Listbox';

export type ListboxProps = Omit<ElementProps, 'onSelectionChange'> & {
  label: string;
  items: CosmListbox['items'];
  selectedValues?: readonly string[];
  onSelectionChange?: (event: CustomEvent<ListboxSelectionChangeDetail>) => void;
};
