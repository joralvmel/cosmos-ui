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
  { route: '/popover', title: 'Popover', description: 'TODO(generator): short description.' },
  {
    route: '/listbox',
    title: 'Listbox',
    description: 'Grouped, keyboard-navigable single or multiple selection.',
  },
] as const;
