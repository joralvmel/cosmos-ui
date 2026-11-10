import { css } from 'lit';

/** Visible focus indicator shared by interactive elements. */
export const focusRing = css`
  :focus-visible {
    outline: 2px solid var(--cosm-focus-ring, oklch(0.55 0.2 268));
    outline-offset: 2px;
  }
`;

/** Base box model reset for shadow roots. */
export const boxSizing = css`
  :host {
    box-sizing: border-box;
  }
  *,
  *::before,
  *::after {
    box-sizing: inherit;
  }
`;
