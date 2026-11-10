/** Consumer stacks supported by the setup guides, `cosmos init-ai` and the MCP server. */
export const stacks = ['react', 'next', 'angular', 'html', 'react-native', 'tailwind'] as const;
export type Stack = (typeof stacks)[number];

export const DOCS_URL = 'https://joralvmel.github.io/cosmos-ui/';

export interface SetupStep {
  title: string;
  /** File the code goes into (e.g. `src/main.tsx`). */
  file?: string;
  language?: string;
  code?: string;
  text?: string;
}

export interface SetupGuide {
  stack: Stack;
  title: string;
  /** Shell commands to install the packages. */
  install: string[];
  steps: SetupStep[];
  notes: string[];
  /** Path of the framework guide in the docs site. */
  guide: string;
}

const themeHtml = '<html data-theme="cosmos" data-mode="system">';

const guides: Record<Stack, SetupGuide> = {
  react: {
    stack: 'react',
    title: 'React (Vite)',
    install: ['npm install @joralvmel/cosmos-react @joralvmel/cosmos-tokens'],
    steps: [
      {
        title: 'Load the tokens once',
        file: 'src/main.tsx',
        language: 'tsx',
        code: "import '@joralvmel/cosmos-tokens/tokens.css';",
      },
      {
        title: 'Choose theme and mode',
        file: 'index.html',
        language: 'html',
        code: themeHtml,
      },
      {
        title: 'Use components',
        file: 'src/App.tsx',
        language: 'tsx',
        code: "import { Button } from '@joralvmel/cosmos-react';\n\nexport default function App() {\n  return <Button onPress={event => console.log(event.detail.source)}>Save</Button>;\n}",
      },
    ],
    notes: [
      'Event props (`onPress`, `onChange`…) receive the original CustomEvent: read `event.detail`.',
      'Change theme and mode at runtime with `setTheme()` / `setMode()` from `@joralvmel/cosmos-tokens/runtime`.',
    ],
    guide: 'guides/react-vite/',
  },
  next: {
    stack: 'next',
    title: 'Next.js (App Router)',
    install: ['npm install @joralvmel/cosmos-react @joralvmel/cosmos-tokens'],
    steps: [
      {
        title: 'Load the tokens and avoid a theme flash',
        file: 'app/layout.tsx',
        language: 'tsx',
        code: 'import \'@joralvmel/cosmos-tokens/tokens.css\';\nimport { themeInitScript } from \'@joralvmel/cosmos-tokens/runtime\';\nimport Script from \'next/script\';\n\nexport default function RootLayout({ children }: { children: React.ReactNode }) {\n  return (\n    <html lang="en" data-theme="cosmos" data-mode="system" suppressHydrationWarning>\n      <body>\n        <Script id="cosmos-theme" strategy="beforeInteractive">\n          {themeInitScript()}\n        </Script>\n        {children}\n      </body>\n    </html>\n  );\n}',
      },
      {
        title: 'Use components in Client Components',
        file: 'app/save-button.tsx',
        language: 'tsx',
        code: "'use client';\n\nimport { Button } from '@joralvmel/cosmos-react';\n\nexport function SaveButton() {\n  return <Button onPress={() => console.log('saved')}>Save</Button>;\n}",
      },
    ],
    notes: [
      "Cosmos components are Web Components: render them from Client Components (`'use client'`). Server Components can render the Client Component that wraps them.",
      'The server HTML contains the custom element tag; it upgrades in the browser.',
    ],
    guide: 'guides/nextjs/',
  },
  angular: {
    stack: 'angular',
    title: 'Angular (standalone)',
    install: ['npm install @joralvmel/cosmos-angular @joralvmel/cosmos-tokens'],
    steps: [
      {
        title: 'Load the tokens',
        file: 'angular.json',
        language: 'json',
        code: '"styles": ["node_modules/@joralvmel/cosmos-tokens/dist/tokens.css", "src/styles.css"]',
      },
      {
        title: 'Choose theme and mode',
        file: 'src/index.html',
        language: 'html',
        code: themeHtml,
      },
      {
        title: 'Import components',
        file: 'src/app/app.component.ts',
        language: 'ts',
        code: "import { Component } from '@angular/core';\nimport { CosmButtonComponent } from '@joralvmel/cosmos-angular';\n\n@Component({\n  selector: 'app-root',\n  imports: [CosmButtonComponent],\n  template: `<cosm-button (press)=\"save($event.detail.source)\">Save</cosm-button>`,\n})\nexport class AppComponent {\n  save(source: string) {}\n}",
      },
    ],
    notes: [
      'Components are standalone; import them individually or spread `COSMOS_COMPONENTS`.',
      'Outputs re-emit the original CustomEvent: use `$event.detail`. Form controls provide ControlValueAccessors.',
    ],
    guide: 'guides/angular/',
  },
  html: {
    stack: 'html',
    title: 'HTML / CDN',
    install: [],
    steps: [
      {
        title: 'Load tokens and components from a CDN',
        file: 'index.html',
        language: 'html',
        code: '<!doctype html>\n<html lang="en" data-theme="cosmos" data-mode="system">\n  <head>\n    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@joralvmel/cosmos-tokens/dist/tokens.css" />\n    <script type="module" src="https://esm.sh/@joralvmel/cosmos-elements/button"></script>\n  </head>\n  <body>\n    <cosm-button variant="soft">Save</cosm-button>\n    <script type="module">\n      document.querySelector(\'cosm-button\').addEventListener(\'cosm-press\', event => {\n        console.log(event.detail.source);\n      });\n    </script>\n  </body>\n</html>',
      },
    ],
    notes: [
      'With a bundler, `npm install @joralvmel/cosmos-elements @joralvmel/cosmos-tokens` and import `@joralvmel/cosmos-elements/<component>`.',
      'DOM events are `cosm-*` CustomEvents that bubble and cross shadow roots.',
    ],
    guide: 'guides/html-cdn/',
  },
  'react-native': {
    stack: 'react-native',
    title: 'React Native (Expo)',
    install: ['npx expo install @joralvmel/cosmos-native'],
    steps: [
      {
        title: 'Provide a theme',
        file: 'app/_layout.tsx',
        language: 'tsx',
        code: 'import { CosmosThemeProvider } from \'@joralvmel/cosmos-native\';\nimport { Stack } from \'expo-router\';\n\nexport default function Layout() {\n  return (\n    <CosmosThemeProvider theme="cosmos" mode="system">\n      <Stack />\n    </CosmosThemeProvider>\n  );\n}',
      },
      {
        title: 'Use components',
        file: 'app/index.tsx',
        language: 'tsx',
        code: "import { Button } from '@joralvmel/cosmos-native';\n\nexport default function Home() {\n  return <Button onPress={({ source }) => console.log(source)}>Save</Button>;\n}",
      },
    ],
    notes: [
      'Callbacks receive the event detail directly (`onPress(detail)`).',
      '`useTheme()` returns colors, spacing, radius and typography as numbers for your own styles.',
    ],
    guide: 'guides/react-native/',
  },
  tailwind: {
    stack: 'tailwind',
    title: 'Tailwind CSS v4',
    install: [
      'npm install @joralvmel/cosmos-tailwind && npm install -D tailwindcss @tailwindcss/vite',
    ],
    steps: [
      {
        title: 'Import the Cosmos theme after Tailwind',
        file: 'src/styles.css',
        language: 'css',
        code: '@import "tailwindcss";\n@import "@joralvmel/cosmos-tailwind";',
      },
      {
        title: 'Use token utilities',
        language: 'html',
        code: '<div class="bg-surface text-fg rounded-lg shadow-md p-4 dark:bg-surface-raised">\n  <p class="text-fg-muted">Uses Cosmos tokens in every theme and mode.</p>\n</div>',
      },
    ],
    notes: [
      'Default Tailwind colors are disabled: use semantic colors (`bg-primary`, `text-danger-text`…).',
      '`dark:` follows `data-mode` (including `system`); `theme-<name>:` targets one theme.',
    ],
    guide: 'guides/tailwind/',
  },
};

export function isStack(value: string): value is Stack {
  return (stacks as readonly string[]).includes(value);
}

export function setupGuide(stack: Stack): SetupGuide {
  return guides[stack];
}

/** Setup guide as Markdown (MCP `get_setup`, `cosmos init-ai`, llms.md). */
export function setupMarkdown(stack: Stack): string {
  const guide = guides[stack];
  const lines = [`## Setup: ${guide.title}`, ''];
  if (guide.install.length > 0) lines.push('```bash', ...guide.install, '```', '');
  for (const step of guide.steps) {
    lines.push(`**${step.title}**${step.file ? ` (\`${step.file}\`)` : ''}`, '');
    if (step.text) lines.push(step.text, '');
    if (step.code) lines.push(`\`\`\`${step.language ?? ''}`, step.code, '```', '');
  }
  if (guide.notes.length > 0) lines.push(...guide.notes.map(note => `- ${note}`), '');
  lines.push(`Guide: ${DOCS_URL}${guide.guide}`);
  return lines.join('\n');
}

const commonRules = [
  'Use Cosmos components before writing custom UI; check `list_components` / the component status page for what exists.',
  'Style with Cosmos tokens: `var(--cosm-*)` in CSS or the Tailwind theme utilities (`bg-primary`, `text-fg-muted`, `rounded-md`). Never hard-code colors.',
  'Set the theme and mode with `data-theme` and `data-mode` on the root element (or `CosmosThemeProvider` on React Native).',
  'Keep accessibility: give icon-only buttons a `label`, never rely on color alone, keep keyboard support.',
  'Never render untrusted HTML (`innerHTML`, `dangerouslySetInnerHTML`) and never build class names from user input.',
];

const stackRules: Record<Stack, string[]> = {
  react: [
    'Import components from `@joralvmel/cosmos-react`; event props receive the CustomEvent (`event.detail`).',
  ],
  next: [
    "Import components from `@joralvmel/cosmos-react` only in Client Components (`'use client'`).",
    'Load `@joralvmel/cosmos-tokens/tokens.css` in `app/layout.tsx`.',
  ],
  angular: [
    'Import the standalone components from `@joralvmel/cosmos-angular` (`CosmButtonComponent`…); outputs emit the CustomEvent (`$event.detail`).',
  ],
  html: [
    'Use `<cosm-*>` elements and listen to `cosm-*` DOM events; import each component from `@joralvmel/cosmos-elements/<name>`.',
  ],
  'react-native': [
    'Import components from `@joralvmel/cosmos-native`, wrap the app in `CosmosThemeProvider` and read values with `useTheme()`.',
    'Callbacks receive the detail directly (`onPress(detail)`).',
  ],
  tailwind: ['Only use the Cosmos Tailwind theme utilities; default Tailwind colors are disabled.'],
};

/** Rules for AI assistants working in a consumer project. */
export function aiRules(stack?: Stack): string[] {
  return [...commonRules, ...(stack ? stackRules[stack] : [])];
}
