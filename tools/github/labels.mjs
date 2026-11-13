// Repository labels, created by `node tools/github/setup-repo.mjs --apply`. `.github/labeler.yml` and
// the issue templates may only use labels listed here (checked by tools/test/github.test.mjs).

export const packages = [
  'tokens',
  'tailwind',
  'core',
  'elements',
  'react',
  'angular',
  'native',
  'charts-core',
  'charts',
  'charts-native',
  'icons',
  'i18n',
  'mcp',
  'cli',
];

export const labels = [
  { name: 'type:bug', color: 'd73a4a', description: 'Something does not work as documented' },
  { name: 'type:component', color: '0e8a16', description: 'New component or component capability' },
  { name: 'type:feature', color: 'a2eeef', description: 'New feature outside components' },
  { name: 'type:docs', color: '0075ca', description: 'Documentation' },
  { name: 'type:chore', color: 'cfd3d7', description: 'Maintenance and tooling' },
  { name: 'status:triage', color: 'fbca04', description: 'Needs triage' },
  { name: 'status:blocked', color: 'b60205', description: 'Blocked by another issue or decision' },
  { name: 'breaking', color: 'b60205', description: 'Breaking change (major changeset)' },
  { name: 'release', color: 'c5def5', description: 'Release pull request' },
  { name: 'dependencies', color: '0366d6', description: 'Dependency updates' },
  { name: 'security', color: 'b60205', description: 'Vulnerabilities and security fixes' },
  { name: 'ci', color: '5319e7', description: 'Workflows and automation' },
  { name: 'good first issue', color: '7057ff', description: 'Good for newcomers' },
  { name: 'help wanted', color: '008672', description: 'Extra attention is needed' },
  {
    name: 'area:ai-layer',
    color: 'd4c5f9',
    description: 'Agents, skills, prompts and instructions',
  },
  { name: 'area:tools', color: 'd4c5f9', description: 'Repository tools and generator' },
  { name: 'app:docs', color: 'bfd4f2', description: 'Documentation site' },
  { name: 'app:native-demo', color: 'bfd4f2', description: 'Expo demo app' },
  ...packages.map(name => ({
    name: `pkg:${name}`,
    color: 'c2e0c6',
    description: `@joralvmel/cosmos-${name}`,
  })),
];
