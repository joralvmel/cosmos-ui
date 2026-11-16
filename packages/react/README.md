# @joralvmel/cosmos-react

React wrappers for [Cosmos UI](../../README.md).

React 19 wrappers of the Cosmos Web Components. Install with React DOM 19; both are peer dependencies.

```tsx
import '@joralvmel/cosmos-tokens/tokens.css';
import { Button } from '@joralvmel/cosmos-react';

export function Toolbar() {
  return (
    <Button variant="soft" onPress={event => console.log(event.detail.source)}>
      Save
    </Button>
  );
}
```

For controlled text entry, bind `value` and update it from the original event detail:

```tsx
import { useState } from 'react';
import { TextField } from '@joralvmel/cosmos-react';

export function EmailField() {
  const [email, setEmail] = useState('');
  return (
    <TextField
      label="Email"
      type="email"
      value={email}
      onChange={event => setEmail(event.detail.value)}
      clearable
      clearLabel="Clear email"
    />
  );
}
```

`onChange` and `onSubmit` receive the original bubbling DOM `CustomEvent`; use `.detail.value`.
Passing `value`, including an empty string, makes the field controlled.
The adapter synchronizes `onChange` updates with React DOM before Lit reconciles the controlled
value, so ordinary synchronous `setState` handlers do not lose rapid keystrokes. Consumers do not
need to call `flushSync`; deferred updates still leave the previous controlled value in place
until the owner accepts the proposal.

For independent icon colors, put the text-field CSS hooks on a `className` or `style`:
`--cosm-text-field-start-icon-color`, `--cosm-text-field-start-icon-focus-color`, and the corresponding
`end-icon` hooks. `iconFocusScope="control"` (default) includes input/action focus; `"input"` limits
focus colors to the editable input. Focus overrides are optional and do not recolor action icons.

## License

MIT
