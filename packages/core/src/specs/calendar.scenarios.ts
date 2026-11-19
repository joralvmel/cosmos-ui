import type { Platform } from '../contract.js';

export type CalendarKey =
  | 'ArrowLeft'
  | 'ArrowRight'
  | 'ArrowUp'
  | 'ArrowDown'
  | 'Home'
  | 'End'
  | 'PageUp'
  | 'PageDown'
  | 'Shift+PageUp'
  | 'Shift+PageDown'
  | 'Enter'
  | ' ';

export type CalendarAction =
  | { type: 'select'; value: string }
  | { type: 'sync'; value: string | undefined }
  | { type: 'navigate'; months: number }
  | { type: 'key'; key: CalendarKey };

export interface CalendarScenario {
  name: string;
  props: {
    value?: string;
    defaultValue?: string;
    min?: string;
    max?: string;
    locale?: string;
    disabled?: boolean;
  };
  actions: readonly CalendarAction[];
  expected: {
    value: string | undefined;
    changes: readonly string[];
    month: string;
    activeDate: string | undefined;
    disabled: boolean;
  };
  platforms?: readonly Platform[];
}

const may = { defaultValue: '2024-05-15', locale: 'en-US' };

/** Normative date selection and navigation cases shared by platform drivers. */
export const calendarScenarios: readonly CalendarScenario[] = [
  {
    name: 'defaultValue initializes autonomous selection',
    props: may,
    actions: [],
    expected: {
      value: '2024-05-15',
      changes: [],
      month: '2024-05-01',
      activeDate: '2024-05-15',
      disabled: false,
    },
  },
  {
    name: 'autonomous selection commits and proposes an enabled date',
    props: may,
    actions: [{ type: 'select', value: '2024-05-16' }],
    expected: {
      value: '2024-05-16',
      changes: ['2024-05-16'],
      month: '2024-05-01',
      activeDate: '2024-05-16',
      disabled: false,
    },
  },
  {
    name: 'controlled selection waits for the owner',
    props: { value: '2024-05-15', locale: 'en-US' },
    actions: [{ type: 'select', value: '2024-05-16' }],
    expected: {
      value: '2024-05-15',
      changes: ['2024-05-16'],
      month: '2024-05-01',
      activeDate: '2024-05-16',
      disabled: false,
    },
  },
  {
    name: 'controlled selection follows an accepted value',
    props: { value: '2024-05-15', locale: 'en-US' },
    actions: [
      { type: 'select', value: '2024-05-16' },
      { type: 'sync', value: '2024-05-16' },
    ],
    expected: {
      value: '2024-05-16',
      changes: ['2024-05-16'],
      month: '2024-05-01',
      activeDate: '2024-05-16',
      disabled: false,
    },
  },
  {
    name: 'bounds prevent out-of-range selection',
    props: { ...may, min: '2024-05-10', max: '2024-05-20' },
    actions: [
      { type: 'select', value: '2024-05-09' },
      { type: 'select', value: '2024-05-21' },
    ],
    expected: {
      value: '2024-05-15',
      changes: [],
      month: '2024-05-01',
      activeDate: '2024-05-15',
      disabled: false,
    },
  },
  {
    name: 'disabled calendar prevents selection and navigation',
    props: { ...may, disabled: true },
    actions: [
      { type: 'select', value: '2024-05-16' },
      { type: 'navigate', months: 1 },
    ],
    expected: {
      value: '2024-05-15',
      changes: [],
      month: '2024-05-01',
      activeDate: undefined,
      disabled: true,
    },
  },
  {
    name: 'selecting an adjacent-month date updates the visible month',
    props: may,
    actions: [{ type: 'select', value: '2024-04-30' }],
    expected: {
      value: '2024-04-30',
      changes: ['2024-04-30'],
      month: '2024-04-01',
      activeDate: '2024-04-30',
      disabled: false,
    },
  },
  {
    name: 'keyboard navigation changes focus before selection',
    props: may,
    actions: [
      { type: 'key', key: 'ArrowRight' },
      { type: 'key', key: 'Enter' },
    ],
    expected: {
      value: '2024-05-16',
      changes: ['2024-05-16'],
      month: '2024-05-01',
      activeDate: '2024-05-16',
      disabled: false,
    },
    platforms: ['web', 'react', 'angular'],
  },
  {
    name: 'month navigation preserves selection',
    props: may,
    actions: [{ type: 'navigate', months: 1 }],
    expected: {
      value: '2024-05-15',
      changes: [],
      month: '2024-06-01',
      activeDate: '2024-06-15',
      disabled: false,
    },
  },
  {
    name: 'month navigation can browse toward a future minimum',
    props: { ...may, min: '2024-07-01' },
    actions: [{ type: 'navigate', months: 1 }],
    expected: {
      value: '2024-05-15',
      changes: [],
      month: '2024-06-01',
      activeDate: '2024-06-15',
      disabled: false,
    },
  },
];

export const calendarScenariosFor = (platform: Platform) =>
  calendarScenarios.filter(
    scenario => !scenario.platforms || scenario.platforms.includes(platform)
  );
