/** Demo screens listed on the home screen. The generator appends new components here. */
export const screens = [
  { route: '/button', title: 'Button', description: 'Variants, tones, sizes and states.' },
  { route: '/icon', title: 'Icon', description: 'Decorative and informative Lucide glyphs.' },
  {
    route: '/text-field',
    title: 'Text Field',
    description: 'Single-line text, actions and states.',
  },
  {
    route: '/icon-button',
    title: 'Icon Button',
    description: 'Labeled icon actions, variants and toggle states.',
  },
  { route: '/popover', title: 'Popover', description: 'Anchored floating content and placement.' },
  {
    route: '/listbox',
    title: 'Listbox',
    description: 'Grouped, keyboard-navigable single or multiple selection.',
  },
  {
    route: '/checkbox',
    title: 'Checkbox',
    description: 'Controlled, mixed, required and custom-size choices.',
  },
  { route: '/switch', title: 'Switch', description: 'Controlled and autonomous binary settings.' },
  {
    route: '/badge',
    title: 'Badge',
    description: 'Static labels, count text and appearance controls.',
  },
  {
    route: '/calendar',
    title: 'Calendar',
    description: 'Date selection, locale, bounds and states.',
  },
  { route: '/textarea', title: 'Textarea', description: 'Labeled multiline text and states.' },
  {
    route: '/radio-group',
    title: 'Radio Group',
    description: 'Single selection, orientation, validation and controlled state.',
  },
] as const;
