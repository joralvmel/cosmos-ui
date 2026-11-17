import { iconContract } from './specs/icon.js';
import { iconButtonContract } from './specs/icon-button.js';
import { listboxContract } from './specs/listbox.js';
import { popoverContract } from './specs/popover.js';
import { textFieldContract } from './specs/text-field.js';

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
  generateComposedSnippets,
  generateSnippets,
  listboxItemExamples,
  listboxValueExamples,
  pascalCase,
  type SnippetChild,
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
  findListboxMatch,
  getListboxInitialActive,
  getListboxOptions,
  getListboxSelection,
  moveListboxActive,
  validateListboxSize,
  validateListboxValues,
} from './headless/listbox.js';
export {
  getPressableState,
  type PressableInput,
  type PressableState,
} from './headless/pressable.js';
export {
  getTextFieldState,
  type TextFieldState,
  type TextFieldStateInput,
} from './headless/text-field.js';
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
  icon: iconContract,
  'text-field': textFieldContract,
  'icon-button': iconButtonContract,
  popover: popoverContract,
  listbox: listboxContract,
} as const;
export { iconContract } from './specs/icon.js';
export {
  type IconScenario,
  iconScenarios,
  iconScenariosFor,
} from './specs/icon.scenarios.js';
export {
  type IconButtonPressDetail,
  type IconButtonPressedChangeDetail,
  iconButtonContract,
} from './specs/icon-button.js';
export {
  type IconButtonAction,
  type IconButtonScenario,
  iconButtonScenarios,
  iconButtonScenariosFor,
} from './specs/icon-button.scenarios.js';
export {
  type ListboxGroup,
  type ListboxItem,
  type ListboxOption,
  type ListboxSelectionChangeDetail,
  type ListboxSelectionMode,
  listboxContract,
} from './specs/listbox.js';
export {
  type ListboxAction,
  type ListboxScenario,
  listboxScenarioItems,
  listboxScenarios,
  listboxScenariosFor,
} from './specs/listbox.scenarios.js';
export {
  type PopoverAlign,
  type PopoverCloseReason,
  type PopoverHandle,
  type PopoverOpenChangeDetail,
  type PopoverSide,
  popoverContract,
} from './specs/popover.js';
export {
  type PopoverAction,
  type PopoverChangeExpectation,
  type PopoverScenario,
  popoverScenarios,
  popoverScenariosFor,
} from './specs/popover.scenarios.js';
export {
  type TextFieldChangeDetail,
  type TextFieldSubmitDetail,
  textFieldContract,
} from './specs/text-field.js';
export {
  type TextFieldAction,
  type TextFieldScenario,
  textFieldScenarios,
  textFieldScenariosFor,
} from './specs/text-field.scenarios.js';
