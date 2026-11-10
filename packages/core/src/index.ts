export {
  buildOrder,
  type CatalogEntry,
  type ComponentCategory,
  type ComponentStatus,
  catalog,
  catalogEntry,
} from './catalog.js';
export {
  type ActiveProp,
  activeProps,
  type ControlValue,
  type ControlValues,
  generateSnippets,
  pascalCase,
  type SnippetTarget,
  snippetTargets,
  supportsTarget,
  toAttribute,
} from './codegen.js';
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
export {
  componentReference,
  contractMarkdown,
  eventsMarkdown,
  propsMarkdown,
  propType,
  snippetsMarkdown,
  snippetTitles,
} from './markdown.js';
export {
  aiRules,
  DOCS_URL,
  isStack,
  type SetupGuide,
  type SetupStep,
  type Stack,
  setupGuide,
  setupMarkdown,
  stacks,
} from './setup.js';
export { type ButtonPressDetail, buttonContract, type PressSource } from './specs/button.js';
export {
  type ButtonAction,
  type ButtonScenario,
  buttonScenarios,
  buttonScenariosFor,
} from './specs/button.scenarios.js';

import { buttonContract } from './specs/button.js';

/** Every component contract, keyed by name. Used by docs, AI references and drift tests. */
export const contracts = {
  button: buttonContract,
} as const;
