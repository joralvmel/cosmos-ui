import type { Platform } from '../contract.js';

export interface IconScenario {
  name: string;
  props: { size?: 'sm' | 'md' | 'lg' | number; label?: string; decorative?: boolean };
  expected: { size: 'sm' | 'md' | 'lg' | number; label?: string; decorative: boolean };
  platforms?: readonly Platform[];
}

/** Shared rendering and accessibility scenarios, run by every platform. */
export const iconScenarios: readonly IconScenario[] = [
  {
    name: 'uses the medium decorative default',
    props: {},
    expected: { size: 'md', decorative: true },
  },
  {
    name: 'supports a small informative icon',
    props: { size: 'sm', decorative: false, label: 'Home' },
    expected: { size: 'sm', decorative: false, label: 'Home' },
  },
  {
    name: 'supports a large decorative icon',
    props: { size: 'lg' },
    expected: { size: 'lg', decorative: true },
  },
  {
    name: 'supports a numeric decorative size',
    props: { size: 32 },
    expected: { size: 32, decorative: true },
  },
];

export const iconScenariosFor = (platform: Platform) =>
  iconScenarios.filter(scenario => !scenario.platforms || scenario.platforms.includes(platform));
