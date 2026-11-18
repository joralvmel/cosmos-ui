import type { Platform } from '../contract.js';

export interface BadgeScenario {
  name: string;
  text: string;
  props: {
    variant?: 'soft' | 'solid' | 'outline';
    tone?: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
    size?: 'sm' | 'md' | 'lg';
  };
  expected: {
    variant: 'soft' | 'solid' | 'outline';
    tone: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
    size: 'sm' | 'md' | 'lg';
    text: string;
  };
  platforms?: readonly Platform[];
}

/** Shared static rendering scenarios for the web, React, Angular and native implementations. */
export const badgeScenarios: readonly BadgeScenario[] = [
  {
    name: 'renders its caller-provided label with default appearance',
    text: 'Ready',
    props: {},
    expected: { variant: 'soft', tone: 'neutral', size: 'md', text: 'Ready' },
  },
  {
    name: 'supports an intent tone and solid treatment',
    text: 'Warning',
    props: { variant: 'solid', tone: 'warning' },
    expected: { variant: 'solid', tone: 'warning', size: 'md', text: 'Warning' },
  },
  {
    name: 'supports outline treatment and a compact size',
    text: 'Draft',
    props: { variant: 'outline', tone: 'info', size: 'sm' },
    expected: { variant: 'outline', tone: 'info', size: 'sm', text: 'Draft' },
  },
  {
    name: 'renders zero as ordinary caller-formatted text',
    text: '0',
    props: { tone: 'success', size: 'lg' },
    expected: { variant: 'soft', tone: 'success', size: 'lg', text: '0' },
  },
  {
    name: 'supports the danger tone with the default soft treatment',
    text: 'Blocked',
    props: { tone: 'danger' },
    expected: { variant: 'soft', tone: 'danger', size: 'md', text: 'Blocked' },
  },
];

export const badgeScenariosFor = (platform: Platform) =>
  badgeScenarios.filter(scenario => !scenario.platforms || scenario.platforms.includes(platform));
