/** Theme-independent tokens. Values are rem-based for the web; `native.ts` converts them to points. */
export const baseTokens = {
  space: {
    unit: '0.25rem',
    '2xs': '0.125rem',
    xs: '0.25rem',
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
    '2xl': '2rem',
    '3xl': '3rem',
  },
  font: {
    sans: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: 'ui-monospace, "SFMono-Regular", "Cascadia Code", Menlo, Consolas, monospace',
  },
  text: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
  leading: { tight: '1.25', normal: '1.5', relaxed: '1.7' },
  weight: { regular: '400', medium: '500', semibold: '600', bold: '700' },
  control: { sm: '2rem', md: '2.5rem', lg: '3rem' },
  duration: { fast: '120ms', normal: '200ms', slow: '320ms' },
  easing: {
    standard: 'cubic-bezier(0.2, 0, 0, 1)',
    enter: 'cubic-bezier(0, 0, 0.2, 1)',
    exit: 'cubic-bezier(0.4, 0, 1, 1)',
  },
  z: {
    dropdown: '1000',
    sticky: '1100',
    overlay: '1200',
    modal: '1300',
    toast: '1400',
    tooltip: '1500',
  },
  breakpoint: { sm: '40rem', md: '48rem', lg: '64rem', xl: '80rem' },
} as const;

export type BaseTokens = typeof baseTokens;
