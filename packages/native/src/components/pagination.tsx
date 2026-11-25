import {
  type ContractProps,
  getPaginationView,
  type PaginationChangeDetail,
  type paginationContract,
} from '@joralvmel/cosmos-core';
import { chevronLeft } from '@joralvmel/cosmos-icons/chevron-left';
import { chevronRight } from '@joralvmel/cosmos-icons/chevron-right';
import { chevronsLeft } from '@joralvmel/cosmos-icons/chevrons-left';
import { chevronsRight } from '@joralvmel/cosmos-icons/chevrons-right';
import { type ComponentRef, useLayoutEffect, useRef, useState } from 'react';
import {
  Platform,
  type Pressable,
  type StyleProp,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../theme/theme-provider.js';
import { Button } from './button.js';
import { Icon } from './icon.js';
import { IconButton } from './icon-button.js';

type ContractPaginationProps = ContractProps<typeof paginationContract, 'native'>;

export interface PaginationProps extends ContractPaginationProps {
  onPageChange?: (detail: PaginationChangeDetail) => void;
  style?: StyleProp<ViewStyle>;
  controlStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

/** Props handled by the renderer; compared with the shared contract. */
export const paginationPropNames = [
  'totalPages',
  'page',
  'defaultPage',
  'label',
  'previousLabel',
  'nextLabel',
  'firstLabel',
  'lastLabel',
  'pageLabel',
  'summaryLabel',
  'locale',
  'direction',
  'presentation',
  'variant',
  'size',
  'showFirstLast',
  'disabled',
] as const satisfies readonly (keyof ContractPaginationProps)[];

type FocusTarget = ComponentRef<typeof Pressable>;

/** Localized pagination composed from Cosmos controls and platform-native accessibility. */
export function Pagination({
  onPageChange,
  style,
  controlStyle,
  testID,
  ...props
}: PaginationProps) {
  const theme = useTheme();
  const [ownedPage, setOwnedPage] = useState(props.defaultPage ?? 1);
  const [focusRequest, setFocusRequest] = useState(0);
  const pendingFocus = useRef<string | null>(null);
  const controls = useRef(new Map<string, FocusTarget>());
  const view = getPaginationView(props, props.page ?? ownedPage);
  const controlled = props.page !== undefined;
  const disabled = props.disabled ?? false;
  const showFirstLast = props.showFirstLast ?? false;
  const customStyle = StyleSheet.flatten(controlStyle);
  const customHeight = customStyle?.minHeight;
  const customWidth = customStyle?.minWidth;
  if (
    (customHeight !== undefined &&
      (typeof customHeight !== 'number' || !Number.isFinite(customHeight))) ||
    (customWidth !== undefined &&
      (typeof customWidth !== 'number' || !Number.isFinite(customWidth)))
  )
    throw new TypeError('Pagination controlStyle minimum dimensions must be finite numbers.');
  const minHeight = Math.max(44, theme.control[view.size], customHeight ?? 0);
  const minWidth = Math.max(44, theme.control[view.size], customWidth ?? 0);
  const targetStyle: StyleProp<ViewStyle> = [controlStyle, { minHeight, minWidth }];

  useLayoutEffect(() => {
    if (!controlled && ownedPage !== view.page) setOwnedPage(view.page);
  }, [controlled, ownedPage, view.page]);

  useLayoutEffect(() => {
    if (!focusRequest || pendingFocus.current === null) return;
    const key = pendingFocus.current;
    pendingFocus.current = null;
    const node = controls.current.values().next().value;
    if (Platform.OS === 'web' && node && 'ownerDocument' in node) {
      const owner = node.ownerDocument;
      if (typeof owner === 'object' && owner && 'activeElement' in owner && 'body' in owner) {
        const focused = owner.activeElement;
        if (
          focused &&
          focused !== owner.body &&
          ![...controls.current.values()].some(control => Object.is(control, focused))
        )
          return;
      }
    }
    const unavailable =
      disabled ||
      ((key === 'previous' || key === 'first') && view.page === 1) ||
      ((key === 'next' || key === 'last') && view.page === view.totalPages);
    const target = !unavailable ? controls.current.get(key) : undefined;
    (
      target ??
      controls.current.get(`page-${view.page}`) ??
      controls.current.get(view.page === 1 ? 'next' : 'previous')
    )?.focus();
  }, [focusRequest, disabled, view.page, view.totalPages]);

  const selectPage = (page: number, key: string) => {
    if (disabled || page < 1 || page > view.totalPages || page === view.page) return;
    pendingFocus.current = key;
    if (!controlled) setOwnedPage(page);
    setFocusRequest(value => value + 1);
    onPageChange?.({ page });
  };
  const bindControl = (key: string) => (node: FocusTarget | null) => {
    if (node) controls.current.set(key, node);
    else controls.current.delete(key);
  };
  const navigation = (kind: 'first' | 'previous' | 'next' | 'last') => {
    const previous = kind === 'first' || kind === 'previous';
    const rtl = view.direction === 'rtl';
    const edge = kind === 'first' || kind === 'last';
    const icon = edge
      ? previous !== rtl
        ? chevronsLeft
        : chevronsRight
      : previous !== rtl
        ? chevronLeft
        : chevronRight;
    const target =
      kind === 'first' ? 1 : kind === 'last' ? view.totalPages : view.page + (previous ? -1 : 1);
    return (
      <IconButton
        ref={bindControl(kind)}
        key={kind}
        label={view[`${kind}Label`]}
        variant="ghost"
        size={view.size}
        disabled={disabled || (previous ? view.page === 1 : view.page === view.totalPages)}
        onPress={() => selectPage(target, kind)}
        style={targetStyle}
      >
        <Icon icon={icon} size={18} />
      </IconButton>
    );
  };

  if (view.totalPages <= 1) return null;
  return (
    <View
      testID={testID}
      role={Platform.OS === 'web' ? 'navigation' : undefined}
      accessibilityLabel={view.label}
      style={[
        {
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: theme.space.xs,
          direction: view.direction,
        },
        style,
      ]}
    >
      {showFirstLast ? navigation('first') : null}
      {navigation('previous')}
      {view.presentation === 'compact' ? (
        <Text
          style={{
            color: theme.colors.fg,
            fontSize: theme.text[view.size],
            paddingHorizontal: theme.space.sm,
          }}
        >
          {view.summary}
        </Text>
      ) : (
        view.items.map((item, index) =>
          typeof item === 'number' ? (
            <Button
              ref={bindControl(`page-${item}`)}
              key={item}
              label={view.pageName(item)}
              currentPage={item === view.page}
              variant={item === view.page ? view.variant : 'ghost'}
              size={view.size}
              disabled={disabled}
              style={targetStyle}
              onPress={() => selectPage(item, `page-${item}`)}
            >
              {view.number(item)}
            </Button>
          ) : (
            <Text
              key={`gap-after-${view.items[index - 1]}`}
              accessible={false}
              aria-hidden
              style={{ color: theme.colors['fg-muted'] }}
            >
              …
            </Text>
          )
        )
      )}
      {navigation('next')}
      {showFirstLast ? navigation('last') : null}
    </View>
  );
}
