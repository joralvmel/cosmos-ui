export interface PressableInput {
  disabled?: boolean | undefined;
  loading?: boolean | undefined;
}

export interface PressableState {
  /** Whether a press should be handled and reported. */
  interactive: boolean;
  /** Removed from interaction and tab order. */
  disabled: boolean;
  /** Busy: keeps focus but ignores presses (`aria-busy`). */
  busy: boolean;
}

/** Platform-neutral state of a pressable control (button, icon button, menu item). */
export function getPressableState({ disabled = false, loading = false }: PressableInput) {
  return {
    interactive: !disabled && !loading,
    disabled,
    busy: loading && !disabled,
  } satisfies PressableState;
}
