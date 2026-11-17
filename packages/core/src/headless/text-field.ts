export interface TextFieldStateInput {
  value?: string | undefined;
  disabled?: boolean | undefined;
  readOnly?: boolean | undefined;
  invalid?: boolean | undefined;
  error?: string | undefined;
  clearable?: boolean | undefined;
  passwordReveal?: boolean | undefined;
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'search' | undefined;
}

export interface TextFieldState {
  /** Whether the user may edit the value. */
  editable: boolean;
  /** Whether the field is disabled rather than merely read-only. */
  disabled: boolean;
  /** External invalid state or a non-empty external error message. */
  invalid: boolean;
  /** Whether an enabled clear action should be shown for the current text. */
  showClearAction: boolean;
  /** Whether an enabled password visibility action should be shown. */
  showPasswordReveal: boolean;
}

/** Resolves text-field affordances without DOM, framework or platform dependencies. */
export function getTextFieldState({
  value = '',
  disabled = false,
  readOnly = false,
  invalid = false,
  error,
  clearable = false,
  passwordReveal = false,
  type = 'text',
}: TextFieldStateInput): TextFieldState {
  const editable = !disabled && !readOnly;

  return {
    editable,
    disabled,
    invalid: invalid || Boolean(error),
    showClearAction: editable && clearable && value.length > 0,
    showPasswordReveal: editable && passwordReveal && type === 'password',
  };
}
