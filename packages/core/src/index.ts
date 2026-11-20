import { badgeContract } from './specs/badge.js';
import { calendarContract } from './specs/calendar.js';
import { checkboxContract } from './specs/checkbox.js';
import { iconContract } from './specs/icon.js';
import { iconButtonContract } from './specs/icon-button.js';
import { listboxContract } from './specs/listbox.js';
import { popoverContract } from './specs/popover.js';
import { radioGroupContract } from './specs/radio-group.js';
import { switchContract } from './specs/switch.js';
import { textFieldContract } from './specs/text-field.js';
import { textareaContract } from './specs/textarea.js';

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
  radioGroupOptionsExamples,
  radioGroupValueExamples,
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
  addCalendarDays,
  addCalendarMonths,
  type CalendarLocaleInfo,
  type CalendarWeekdayName,
  canNavigateCalendarMonth,
  compareCalendarDates,
  formatCalendarDate,
  formatCalendarMonth,
  getCalendarLocaleInfo,
  getCalendarMonth,
  getCalendarMonthDates,
  getCalendarToday,
  getCalendarTodayLabel,
  getCalendarWeekdayNames,
  isCalendarDateSelectable,
  parseCalendarDate,
  tryAddCalendarDays,
  tryAddCalendarMonths,
  validateCalendarBounds,
} from './headless/calendar.js';
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
  getRadioGroupInitialActive,
  moveRadioGroupActive,
  validateRadioGroupOptions,
  validateRadioGroupValue,
} from './headless/radio-group.js';
export { validateSize } from './headless/size.js';
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
  checkbox: checkboxContract,
  switch: switchContract,
  badge: badgeContract,
  calendar: calendarContract,
  textarea: textareaContract,
  'radio-group': radioGroupContract,
} as const;
export { badgeContract } from './specs/badge.js';
export {
  type BadgeScenario,
  badgeScenarios,
  badgeScenariosFor,
} from './specs/badge.scenarios.js';
export { type CalendarChangeDetail, calendarContract } from './specs/calendar.js';
export {
  type CalendarAction,
  type CalendarKey,
  type CalendarScenario,
  calendarScenarios,
  calendarScenariosFor,
} from './specs/calendar.scenarios.js';
export {
  type CheckboxCheckedChangeDetail,
  checkboxContract,
} from './specs/checkbox.js';
export {
  type CheckboxAction,
  type CheckboxScenario,
  checkboxScenarios,
  checkboxScenariosFor,
} from './specs/checkbox.scenarios.js';
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
  type RadioGroupChangeDetail,
  type RadioGroupOption,
  type RadioGroupOptions,
  type RadioGroupReferences,
  type RadioGroupValue,
  radioGroupContract,
} from './specs/radio-group.js';
export {
  type RadioGroupAction,
  type RadioGroupScenario,
  radioGroupScenarioOptions,
  radioGroupScenarios,
  radioGroupScenariosFor,
} from './specs/radio-group.scenarios.js';
export {
  type SwitchCheckedChangeDetail,
  switchContract,
} from './specs/switch.js';
export {
  type SwitchAction,
  type SwitchScenario,
  switchScenarios,
  switchScenariosFor,
} from './specs/switch.scenarios.js';
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
export { type TextareaChangeDetail, textareaContract } from './specs/textarea.js';
export {
  type TextareaAction,
  type TextareaScenario,
  textareaScenarios,
  textareaScenariosFor,
} from './specs/textarea.scenarios.js';
