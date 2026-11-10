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

## License

MIT
