import type { PopoverOpenChangeDetail } from '@joralvmel/cosmos-core';
import { CosmPopover } from '@joralvmel/cosmos-elements/popover';
import { createComponent, type EventName } from '@lit/react';
import * as React from 'react';
import { flushSync } from 'react-dom';

/** React event props of `Popover`, mapped to the original DOM event. */
export const popoverEvents = {
  onOpenChange: 'cosm-open-change' as EventName<CustomEvent<PopoverOpenChangeDetail>>,
};

const PopoverElement = createComponent({
  tagName: 'cosm-popover',
  elementClass: CosmPopover,
  react: React,
  events: popoverEvents,
  displayName: 'PopoverElement',
});

type ElementProps = React.ComponentProps<typeof PopoverElement>;

/** React wrapper; a supplied `open` value, including false, is controlled. */
export const Popover = React.forwardRef<CosmPopover, PopoverProps>((props, forwardedRef) => {
  const { open, onOpenChange, ...elementProps } = props;
  const handleOpenChange = React.useCallback(
    (event: CustomEvent<PopoverOpenChangeDetail>) => {
      if (onOpenChange) flushSync(() => onOpenChange(event));
    },
    [onOpenChange]
  );
  const setRef = React.useCallback(
    (element: CosmPopover | null) => {
      if (element) element.open = open;
      if (typeof forwardedRef === 'function') forwardedRef(element);
      else if (forwardedRef) forwardedRef.current = element;
    },
    [forwardedRef, open]
  );

  return React.createElement(PopoverElement, {
    ...elementProps,
    ...(open === undefined ? {} : { open }),
    onOpenChange: handleOpenChange,
    ref: setRef,
  } as ElementProps);
});
Popover.displayName = 'Popover';

export type PopoverProps = Omit<ElementProps, 'open' | 'onOpenChange'> & {
  open?: boolean;
  onOpenChange?: (event: CustomEvent<PopoverOpenChangeDetail>) => void;
};
