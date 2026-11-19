import type { CalendarChangeDetail } from '@joralvmel/cosmos-core';
import { CosmCalendar } from '@joralvmel/cosmos-elements/calendar';
import { createComponent, type EventName } from '@lit/react';
import * as React from 'react';
import { flushSync } from 'react-dom';

/** React event props of `Calendar`, mapped to the original DOM `CustomEvent`. */
export const calendarEvents = {
  onChange: 'cosm-change' as EventName<CustomEvent<CalendarChangeDetail>>,
};

const CalendarElement = createComponent({
  tagName: 'cosm-calendar',
  elementClass: CosmCalendar,
  react: React,
  events: calendarEvents,
  displayName: 'CalendarElement',
});

type ElementProps = React.ComponentProps<typeof CalendarElement>;

/** React wrapper; binding `value` marks selection as controlled. */
export const Calendar = React.forwardRef<CosmCalendar, CalendarProps>((props, forwardedRef) => {
  const { value, onChange, ...elementProps } = props;
  const handleChange = React.useCallback(
    (event: CustomEvent<CalendarChangeDetail>) => {
      if (onChange) flushSync(() => onChange(event));
    },
    [onChange]
  );
  const setRef = React.useCallback(
    (element: CosmCalendar | null) => {
      if (element) element.valueControlled = value !== undefined;
      if (typeof forwardedRef === 'function') forwardedRef(element);
      else if (forwardedRef) forwardedRef.current = element;
    },
    [forwardedRef, value]
  );
  return React.createElement(CalendarElement, {
    ...elementProps,
    value,
    onChange: handleChange,
    ref: setRef,
  } as ElementProps);
});

Calendar.displayName = 'Calendar';

export type CalendarProps = Omit<ElementProps, 'onChange'> & {
  value?: string;
  onChange?: (event: CustomEvent<CalendarChangeDetail>) => void;
};
