import { CosmTextFieldComponent } from './components/text-field.component.js';

export type {
  ButtonPressDetail,
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
] as const;
export { CosmTextFieldComponent } from './components/text-field.component.js';
