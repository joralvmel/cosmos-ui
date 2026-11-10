import { parseArgs } from 'node:util';
import { isStack, stacks } from '@joralvmel/cosmos-core';
import { initAi, installSteps } from './commands/init-ai.js';

export {
  BLOCK_END,
  BLOCK_START,
  type FileChange,
  type InitAiOptions,
  initAi,
  installSteps,
  instructionsBlock,
  mergeMcpConfig,
  upsertBlock,
} from './commands/init-ai.js';

export interface CliIo {
  out(line: string): void;
  err(line: string): void;
  cwd: string;
}

export const commands = {
  'init-ai': 'Prepare this project for AI assistants (instructions block + MCP server).',
  help: 'Show this help.',
  version: 'Print the CLI version.',
} as const;

const usage = () =>
  [
    'Usage: cosmos <command> [options]',
    '',
    'Commands:',
    ...Object.entries(commands).map(([name, text]) => `  ${name.padEnd(10)}${text}`),
    '',
    'init-ai options:',
    `  --stack <${stacks.join('|')}>   required`,
    '  --claude       also write CLAUDE.md',
    '  --no-copilot   skip .github/copilot-instructions.md',
    '  --no-agents    skip AGENTS.md',
    '  --no-mcp       skip .vscode/mcp.json',
    '  --dry-run      show what would change without writing',
    '  --cwd <dir>    project folder (default: current folder)',
  ].join('\n');

function runInitAi(args: readonly string[], io: CliIo): number {
  const { values } = parseArgs({
    args: [...args],
    allowNegative: true,
    options: {
      stack: { type: 'string' },
      claude: { type: 'boolean', default: false },
      copilot: { type: 'boolean', default: true },
      agents: { type: 'boolean', default: true },
      mcp: { type: 'boolean', default: true },
      'dry-run': { type: 'boolean', default: false },
      cwd: { type: 'string' },
    },
  });
  if (!values.stack || !isStack(values.stack)) {
    io.err(`init-ai needs --stack ${stacks.join('|')}.`);
    return 1;
  }
  const changes = initAi({
    cwd: values.cwd ?? io.cwd,
    stack: values.stack,
    claude: values.claude,
    copilot: values.copilot,
    agents: values.agents,
    mcp: values.mcp,
    dryRun: values['dry-run'],
  });
  for (const change of changes) {
    io.out(`${values['dry-run'] ? '(dry run) ' : ''}${change.action.padEnd(9)} ${change.path}`);
  }
  io.out('');
  io.out(installSteps(values.stack));
  return 0;
}

/** Runs the CLI and returns the exit code. Kept pure for testing; `bin.ts` wires process I/O. */
export function run(args: readonly string[], io: CliIo, version: string): number {
  const [command = 'help', ...rest] = args;
  try {
    switch (command) {
      case 'init-ai':
        return runInitAi(rest, io);
      case 'help':
      case '--help':
      case '-h':
        io.out(usage());
        return 0;
      case 'version':
      case '--version':
      case '-v':
        io.out(version);
        return 0;
      default:
        io.err(`Unknown command "${command}".\n\n${usage()}`);
        return 1;
    }
  } catch (error) {
    io.err(error instanceof Error ? error.message : String(error));
    return 1;
  }
}
