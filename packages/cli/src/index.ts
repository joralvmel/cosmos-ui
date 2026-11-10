export interface CliIo {
  out(line: string): void;
  err(line: string): void;
}

export const commands = {
  help: 'Show this help.',
  version: 'Print the CLI version.',
} as const;

const usage = () =>
  [
    'Usage: cosmos <command>',
    '',
    'Commands:',
    ...Object.entries(commands).map(([name, text]) => `  ${name.padEnd(10)}${text}`),
    '',
    'Planned: init-ai (AI assistant setup), theme create (custom themes).',
  ].join('\n');

/** Runs the CLI and returns the exit code. Kept pure for testing; `bin.ts` wires process I/O. */
export function run(args: readonly string[], io: CliIo, version: string): number {
  const [command = 'help'] = args;
  switch (command) {
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
}
