import type { DialogOpenChangeDetail, DialogSize } from '@joralvmel/cosmos-core';
import { CosmDialog } from '@joralvmel/cosmos-elements/dialog';
import { createComponent, type EventName } from '@lit/react';
import * as React from 'react';
import { flushSync } from 'react-dom';

/** React event props of `Dialog`, mapped to the original DOM event. */
export const dialogEvents = {
  onOpenChange: 'cosm-open-change' as EventName<CustomEvent<DialogOpenChangeDetail>>,
};

const DialogElement = createComponent({
  tagName: 'cosm-dialog',
  elementClass: CosmDialog,
  react: React,
  events: dialogEvents,
  displayName: 'DialogElement',
});

type ElementProps = React.ComponentProps<typeof DialogElement>;

type DialogLayoutProps = {
  size?: DialogSize;
  maxWidth?: number;
  fullWidth?: boolean;
  responsiveFullscreen?: boolean;
  movable?: boolean;
  moveControlsLabel?: string;
  moveUpLabel?: string;
  moveDownLabel?: string;
  moveLeftLabel?: string;
  moveRightLabel?: string;
  moveCenterLabel?: string;
};

/** React wrapper; a supplied `open` value, including false, is controlled. */
export const Dialog = React.forwardRef<CosmDialog, DialogProps>((props, forwardedRef) => {
  const { open, onOpenChange, ...elementProps } = props;
  const handleOpenChange = React.useCallback(
    (event: CustomEvent<DialogOpenChangeDetail>) => {
      if (onOpenChange) flushSync(() => onOpenChange(event));
    },
    [onOpenChange]
  );
  const setRef = React.useCallback(
    (element: CosmDialog | null) => {
      if (element) element.open = open;
      if (typeof forwardedRef === 'function') forwardedRef(element);
      else if (forwardedRef) forwardedRef.current = element;
    },
    [forwardedRef, open]
  );

  return React.createElement(DialogElement, {
    ...elementProps,
    ...(open === undefined ? {} : { open }),
    onOpenChange: handleOpenChange,
    ref: setRef,
  } as ElementProps);
});
Dialog.displayName = 'Dialog';

export type DialogProps = Omit<ElementProps, 'open' | 'onOpenChange' | keyof DialogLayoutProps> & {
  open?: boolean;
  onOpenChange?: (event: CustomEvent<DialogOpenChangeDetail>) => void;
} & DialogLayoutProps;
