# Security policy

## Reporting a vulnerability

Please report vulnerabilities privately through GitHub's "Report a vulnerability" (Security tab) of
`joralvmel/cosmos-ui`. Do not open public issues for security problems. You will get an answer within
7 days.

## Secure coding rules

- **No HTML injection.** Never use `unsafeHTML`, `innerHTML`, `outerHTML`, `insertAdjacentHTML` or
  `dangerouslySetInnerHTML` with data that is not a constant. Build DOM with templates or
  `textContent`.
- **No dynamic class names or CSS from user input.** Map input to known values instead.
- **Validate untrusted data** before use (theme definitions with `defineTheme`, icon definitions with
  `isIconDefinition`); reject `__proto__`, `constructor` and `prototype` keys.
- **Inline scripts** (such as the theme init script) only embed validated values.
- **Dependencies**: add them only when needed, prefer permissive licenses (MIT, ISC, BSD, Apache-2.0)
  and record bundled third-party code in `THIRD_PARTY_NOTICES.md`.
- **Secrets** never go into the repository. CI secrets are read only by the steps that need them.
- **Workflows** use minimal `permissions` and pinned major versions of actions.
