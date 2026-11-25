import type { PaginationChangeDetail } from '@joralvmel/cosmos-core';
import { CosmPagination } from '@joralvmel/cosmos-elements/pagination';
import { createComponent, type EventName } from '@lit/react';
import * as React from 'react';
import { flushSync } from 'react-dom';

/** Original DOM events forwarded by the React adapter. */
export const paginationEvents = {
  onChange: 'cosm-change' as EventName<CustomEvent<PaginationChangeDetail>>,
};

const PaginationElement = createComponent({
  tagName: 'cosm-pagination',
  elementClass: CosmPagination,
  react: React,
  events: paginationEvents,
  displayName: 'PaginationElement',
});

type ElementProps = React.ComponentProps<typeof PaginationElement>;

/** Supplying page keeps state with the owner, including a page of one. */
export const Pagination = React.forwardRef<CosmPagination, PaginationProps>((props, ref) => {
  const { page, onChange, ...rest } = props;
  const handleChange = React.useCallback(
    (event: CustomEvent<PaginationChangeDetail>) => {
      if (onChange) flushSync(() => onChange(event));
    },
    [onChange]
  );
  const setRef = React.useCallback(
    (element: CosmPagination | null) => {
      if (element) element.pageControlled = page !== undefined;
      if (typeof ref === 'function') ref(element);
      else if (ref) ref.current = element;
    },
    [page, ref]
  );
  return React.createElement(PaginationElement, {
    ...rest,
    page,
    onChange: handleChange,
    ref: setRef,
  });
});
Pagination.displayName = 'Pagination';

export type PaginationProps = Omit<ElementProps, 'onChange'> & {
  label: string;
  totalPages: number;
  onChange?: (event: CustomEvent<PaginationChangeDetail>) => void;
};
