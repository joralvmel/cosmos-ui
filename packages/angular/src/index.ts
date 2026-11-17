import { CosmIconButtonComponent } from './components/icon-button.component.js';
import { CosmListboxComponent } from './components/listbox.component.js';
import { CosmPopoverComponent } from './components/popover.component.js';
import { CosmTextFieldComponent } from './components/text-field.component.js';

export type {
  ButtonPressDetail,
  ListboxSelectionChangeDetail,
  PressSource,
  TextFieldChangeDetail,
  TextFieldSubmitDetail,
} from '@joralvmel/cosmos-core';
export { CosmButtonComponent } from './components/button.component.js';
export { CosmIconComponent } from './components/icon.component.js';

import { CosmButtonComponent } from './components/button.component.js';
import { CosmIconComponent } from './components/icon.component.js';

/** Every Cosmos Angular component, for `imports: [...COSMOS_COMPONENTS]`. */
export const COSMOS_COMPONENTS = [
  CosmButtonComponent,
  CosmIconComponent,
  CosmTextFieldComponent,
  CosmIconButtonComponent,
  CosmPopoverComponent,
  CosmListboxComponent,
] as const;
export { CosmIconButtonComponent } from './components/icon-button.component.js';
export { CosmListboxComponent } from './components/listbox.component.js';
export { CosmPopoverComponent } from './components/popover.component.js';
export { CosmTextFieldComponent } from './components/text-field.component.js';
