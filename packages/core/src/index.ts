export {
  buildOrder,
  type CatalogEntry,
  type ComponentCategory,
  type ComponentStatus,
  catalog,
  catalogEntry,
} from './catalog.js';
export {
  type ComponentContract,
  type ContractProps,
  defaults,
  defineContract,
  type EventSpec,
  eventNames,
  type KeyboardSpec,
  type Platform,
  type PropSpec,
  platforms,
  propNames,
  type StateSpec,
  supports,
} from './contract.js';
export {
  getPressableState,
  type PressableInput,
  type PressableState,
} from './headless/pressable.js';
export { type ButtonPressDetail, buttonContract, type PressSource } from './specs/button.js';
export {
  type ButtonAction,
  type ButtonScenario,
  buttonScenarios,
  scenariosFor as buttonScenariosFor,
} from './specs/button.scenarios.js';

import { buttonContract } from './specs/button.js';

/** Every component contract, keyed by name. Used by docs, AI references and drift tests. */
export const contracts = {
  button: buttonContract,
} as const;
