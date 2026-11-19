# @joralvmel/cosmos-angular

Angular components for [Cosmos UI](../../README.md).

Standalone Angular components for the Cosmos Web Components.

```ts
import { Component } from '@angular/core';
import { CosmButtonComponent } from '@joralvmel/cosmos-angular';

@Component({
  selector: 'app-toolbar',
  imports: [CosmButtonComponent],
  template: `<cosm-button variant="soft" (press)="save($event.detail.source)">Save</cosm-button>`,
})
export class ToolbarComponent {
  save(source: string) {}
}
```

`COSMOS_COMPONENTS` contains every component for `imports: [...COSMOS_COMPONENTS]`.

Text fields integrate with Angular Forms through `ControlValueAccessor`; there is no primitive
`[(value)]` promise:

```ts
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CosmTextFieldComponent } from '@joralvmel/cosmos-angular';

@Component({
  selector: 'app-email',
  imports: [ReactiveFormsModule, CosmTextFieldComponent],
  template: `
    <cosm-text-field
      label="Email"
      type="email"
      clearable
      clearLabel="Clear email"
      [formControl]="email"
    />
  `,
})
export class EmailComponent {
  readonly email = new FormControl('', { nonNullable: true, updateOn: 'blur' });
}
```

`(valueChange)` and `(submit)` re-emit the original DOM `CustomEvent`; use `$event.detail.value`.
Reactive Forms handles programmatic writes, touched/disabled state, reset and the configured
`updateOn` strategy.

`cosm-textarea` provides the same `ControlValueAccessor` integration for multiline messages. Its
`(valueChange)` output re-emits the original `CustomEvent`; use `$event.detail.value` when handling
the proposal directly.

Text fields also forward `iconFocusScope` (`control` by default, or `input`) for optional decorative
icon focus colors. Use CSS classes or Angular style bindings with
`--cosm-text-field-start-icon-color`, `--cosm-text-field-start-icon-focus-color`, and the matching
`end-icon` hooks. Normal/focus colors are independent per side and do not recolor affixes or actions.

## License

MIT
