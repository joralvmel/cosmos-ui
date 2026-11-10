export type { ButtonPressDetail, PressSource } from '@joralvmel/cosmos-core';
export { CosmButtonComponent } from './components/button.component.js';

import { CosmButtonComponent } from './components/button.component.js';

/** Every Cosmos Angular component, for `imports: [...COSMOS_COMPONENTS]`. */
export const COSMOS_COMPONENTS = [CosmButtonComponent] as const;
