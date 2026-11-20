import { CosmBadgeComponent } from './components/badge.component.js';
import { CosmCalendarComponent } from './components/calendar.component.js';
import { CosmCheckboxComponent } from './components/checkbox.component.js';
import { CosmIconButtonComponent } from './components/icon-button.component.js';
import { CosmListboxComponent } from './components/listbox.component.js';
import { CosmPopoverComponent } from './components/popover.component.js';
import { CosmRadioGroupComponent } from './components/radio-group.component.js';
import { CosmSwitchComponent } from './components/switch.component.js';
import { CosmTextFieldComponent } from './components/text-field.component.js';
import { CosmTextareaComponent } from './components/textarea.component.js';

export type {
  ButtonPressDetail,
  CheckboxCheckedChangeDetail,
  ListboxSelectionChangeDetail,
  PressSource,
  SwitchCheckedChangeDetail,
  TextareaChangeDetail,
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
  CosmCheckboxComponent,
  CosmSwitchComponent,
  CosmBadgeComponent,
  CosmCalendarComponent,
  CosmTextareaComponent,
  CosmRadioGroupComponent,
] as const;
export { CosmBadgeComponent } from './components/badge.component.js';
export { CosmCalendarComponent } from './components/calendar.component.js';
export { CosmCheckboxComponent } from './components/checkbox.component.js';
export { CosmIconButtonComponent } from './components/icon-button.component.js';
export { CosmListboxComponent } from './components/listbox.component.js';
export { CosmPopoverComponent } from './components/popover.component.js';
export { CosmRadioGroupComponent } from './components/radio-group.component.js';
export { CosmSwitchComponent } from './components/switch.component.js';
export { CosmTextFieldComponent } from './components/text-field.component.js';
export { CosmTextareaComponent } from './components/textarea.component.js';
